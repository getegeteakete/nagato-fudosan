const express = require('express');
const { body, query: queryValidator, validationResult } = require('express-validator');
const { query } = require('../database/connection');
const { logger } = require('../utils/logger');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// バリデーションルール
const propertyValidation = [
  body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title is required'),
  body('description').optional().trim(),
  body('type').isIn(['rent', 'sale']).withMessage('Type must be rent or sale'),
  body('propertyType').isIn(['apartment', 'house', 'office', 'land']).withMessage('Invalid property type'),
  body('price').isInt({ min: 0 }).withMessage('Price must be a positive integer'),
  body('area').isFloat({ min: 0 }).withMessage('Area must be a positive number'),
  body('rooms').isInt({ min: 0 }).withMessage('Rooms must be a non-negative integer'),
  body('age').isInt({ min: 0 }).withMessage('Age must be a non-negative integer'),
  body('address').trim().isLength({ min: 1 }).withMessage('Address is required'),
  body('prefecture').trim().isLength({ min: 1 }).withMessage('Prefecture is required'),
  body('city').trim().isLength({ min: 1 }).withMessage('City is required')
];

const searchValidation = [
  queryValidator('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  queryValidator('type').optional().isIn(['rent', 'sale']).withMessage('Type must be rent or sale'),
  queryValidator('propertyType').optional().isIn(['apartment', 'house', 'office', 'land']).withMessage('Invalid property type'),
  queryValidator('minPrice').optional().isInt({ min: 0 }).withMessage('Min price must be a positive integer'),
  queryValidator('maxPrice').optional().isInt({ min: 0 }).withMessage('Max price must be a positive integer'),
  queryValidator('minArea').optional().isFloat({ min: 0 }).withMessage('Min area must be a positive number'),
  queryValidator('maxArea').optional().isFloat({ min: 0 }).withMessage('Max area must be a positive number')
];

// 物件一覧取得（検索機能付き）
router.get('/', optionalAuth, searchValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      page = 1,
      limit = 20,
      type,
      propertyType,
      prefecture,
      city,
      station,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      minRooms,
      maxRooms,
      maxAge,
      maxWalkingTime,
      features,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    // 検索条件の構築
    let whereConditions = ['is_available = true'];
    let queryParams = [];
    let paramIndex = 1;

    if (type) {
      whereConditions.push(`type = $${paramIndex++}`);
      queryParams.push(type);
    }

    if (propertyType) {
      if (Array.isArray(propertyType)) {
        const placeholders = propertyType.map(() => `$${paramIndex++}`).join(', ');
        whereConditions.push(`property_type IN (${placeholders})`);
        queryParams.push(...propertyType);
      } else {
        whereConditions.push(`property_type = $${paramIndex++}`);
        queryParams.push(propertyType);
      }
    }

    if (prefecture) {
      whereConditions.push(`prefecture = $${paramIndex++}`);
      queryParams.push(prefecture);
    }

    if (city) {
      whereConditions.push(`city ILIKE $${paramIndex++}`);
      queryParams.push(`%${city}%`);
    }

    if (station) {
      whereConditions.push(`station ILIKE $${paramIndex++}`);
      queryParams.push(`%${station}%`);
    }

    if (minPrice) {
      const priceField = type === 'rent' ? 'rent' : 'price';
      whereConditions.push(`${priceField} >= $${paramIndex++}`);
      queryParams.push(minPrice);
    }

    if (maxPrice) {
      const priceField = type === 'rent' ? 'rent' : 'price';
      whereConditions.push(`${priceField} <= $${paramIndex++}`);
      queryParams.push(maxPrice);
    }

    if (minArea) {
      whereConditions.push(`area >= $${paramIndex++}`);
      queryParams.push(minArea);
    }

    if (maxArea) {
      whereConditions.push(`area <= $${paramIndex++}`);
      queryParams.push(maxArea);
    }

    if (minRooms) {
      whereConditions.push(`rooms >= $${paramIndex++}`);
      queryParams.push(minRooms);
    }

    if (maxRooms) {
      whereConditions.push(`rooms <= $${paramIndex++}`);
      queryParams.push(maxRooms);
    }

    if (maxAge) {
      whereConditions.push(`age <= $${paramIndex++}`);
      queryParams.push(maxAge);
    }

    if (maxWalkingTime) {
      whereConditions.push(`walking_time <= $${paramIndex++}`);
      queryParams.push(maxWalkingTime);
    }

    if (features && Array.isArray(features)) {
      const featureConditions = features.map(() => {
        whereConditions.push(`features @> $${paramIndex++}`);
        queryParams.push([features[paramIndex - 2]]);
      });
    }

    // ソート条件
    const validSortFields = ['created_at', 'price', 'rent', 'area', 'age'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // 総件数取得
    const countQuery = `SELECT COUNT(*) FROM properties ${whereClause}`;
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // 物件一覧取得
    const propertiesQuery = `
      SELECT 
        id, title, description, type, property_type, price, rent, 
        management_fee, deposit, key_money, area, rooms, floor, 
        total_floors, age, address, prefecture, city, station, 
        walking_time, features, images, is_available, is_new, 
        created_at, updated_at
      FROM properties 
      ${whereClause}
      ORDER BY ${sortField} ${order}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    queryParams.push(limit, offset);
    const propertiesResult = await query(propertiesQuery, queryParams);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        items: propertiesResult.rows,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });

  } catch (error) {
    logger.error('Properties search error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 物件詳細取得
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        id, title, description, type, property_type, price, rent, 
        management_fee, deposit, key_money, area, rooms, floor, 
        total_floors, age, address, prefecture, city, station, 
        walking_time, features, images, is_available, is_new, 
        created_at, updated_at
      FROM properties 
      WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    logger.error('Property detail error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 物件作成（管理者のみ）
router.post('/', authenticateToken, requireAdmin, propertyValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      title, description, type, propertyType, price, rent, managementFee,
      deposit, keyMoney, area, rooms, floor, totalFloors, age,
      address, prefecture, city, station, walkingTime, features, images
    } = req.body;

    const result = await query(
      `INSERT INTO properties (
        title, description, type, property_type, price, rent, management_fee,
        deposit, key_money, area, rooms, floor, total_floors, age,
        address, prefecture, city, station, walking_time, features, images,
        is_available, is_new, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, $20, $21, true, true, $22
      ) RETURNING *`,
      [
        title, description, type, propertyType, price, rent, managementFee,
        deposit, keyMoney, area, rooms, floor, totalFloors, age,
        address, prefecture, city, station, walkingTime, features, images,
        req.user.userId
      ]
    );

    logger.info('Property created', { propertyId: result.rows[0].id, createdBy: req.user.userId });

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    logger.error('Property creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 物件更新（管理者のみ）
router.put('/:id', authenticateToken, requireAdmin, propertyValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // 物件の存在確認
    const existingProperty = await query(
      'SELECT id FROM properties WHERE id = $1',
      [id]
    );

    if (existingProperty.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    // 動的UPDATE文の構築
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        updateFields.push(`${key} = $${paramIndex++}`);
        updateValues.push(updateData[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    updateValues.push(id);
    const updateQuery = `
      UPDATE properties 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, updateValues);

    logger.info('Property updated', { propertyId: id, updatedBy: req.user.userId });

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    logger.error('Property update error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 物件削除（管理者のみ）
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM properties WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    logger.info('Property deleted', { propertyId: id, deletedBy: req.user.userId });

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });

  } catch (error) {
    logger.error('Property deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
