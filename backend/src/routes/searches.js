const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../database/connection');
const { logger } = require('../utils/logger');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// バリデーションルール
const searchValidation = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Search name is required'),
  body('searchCriteria').isObject().withMessage('Search criteria is required')
];

// 保存された検索条件一覧取得
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        id, name, search_criteria, is_active, created_at, updated_at
      FROM saved_searches
      WHERE user_id = $1 AND is_active = true
      ORDER BY created_at DESC`,
      [req.user.userId]
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    logger.error('Saved searches fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 保存された検索条件作成
router.post('/', authenticateToken, searchValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, searchCriteria } = req.body;

    // 同じ名前の検索条件が既に存在するかチェック
    const existingSearch = await query(
      'SELECT id FROM saved_searches WHERE user_id = $1 AND name = $2 AND is_active = true',
      [req.user.userId, name]
    );

    if (existingSearch.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Search with this name already exists'
      });
    }

    // 検索条件保存
    const result = await query(
      `INSERT INTO saved_searches (user_id, name, search_criteria, is_active)
       VALUES ($1, $2, $3, true)
       RETURNING *`,
      [req.user.userId, name, JSON.stringify(searchCriteria)]
    );

    logger.info('Search saved', { 
      userId: req.user.userId, 
      searchId: result.rows[0].id,
      searchName: name
    });

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    logger.error('Search save error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 保存された検索条件更新
router.put('/:id', authenticateToken, searchValidation, async (req, res) => {
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
    const { name, searchCriteria } = req.body;

    // 検索条件の存在確認
    const existingSearch = await query(
      'SELECT id FROM saved_searches WHERE id = $1 AND user_id = $2 AND is_active = true',
      [id, req.user.userId]
    );

    if (existingSearch.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Saved search not found'
      });
    }

    // 同じ名前の検索条件が他のIDで存在するかチェック
    const duplicateSearch = await query(
      'SELECT id FROM saved_searches WHERE user_id = $1 AND name = $2 AND id != $3 AND is_active = true',
      [req.user.userId, name, id]
    );

    if (duplicateSearch.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Search with this name already exists'
      });
    }

    // 検索条件更新
    const result = await query(
      `UPDATE saved_searches 
       SET name = $1, search_criteria = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [name, JSON.stringify(searchCriteria), id, req.user.userId]
    );

    logger.info('Search updated', { 
      userId: req.user.userId, 
      searchId: id,
      searchName: name
    });

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    logger.error('Search update error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 保存された検索条件削除
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // 検索条件の存在確認
    const existingSearch = await query(
      'SELECT id FROM saved_searches WHERE id = $1 AND user_id = $2 AND is_active = true',
      [id, req.user.userId]
    );

    if (existingSearch.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Saved search not found'
      });
    }

    // 論理削除（is_activeをfalseに設定）
    await query(
      'UPDATE saved_searches SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    );

    logger.info('Search deleted', { 
      userId: req.user.userId, 
      searchId: id
    });

    res.json({
      success: true,
      message: 'Saved search deleted successfully'
    });

  } catch (error) {
    logger.error('Search deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 保存された検索条件詳細取得
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        id, name, search_criteria, is_active, created_at, updated_at
      FROM saved_searches
      WHERE id = $1 AND user_id = $2 AND is_active = true`,
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Saved search not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    logger.error('Saved search detail error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 保存された検索条件の実行（検索結果を返す）
router.post('/:id/execute', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // 保存された検索条件取得
    const searchResult = await query(
      'SELECT search_criteria FROM saved_searches WHERE id = $1 AND user_id = $2 AND is_active = true',
      [id, req.user.userId]
    );

    if (searchResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Saved search not found'
      });
    }

    const searchCriteria = searchResult.rows[0].search_criteria;
    const offset = (page - 1) * limit;

    // 検索条件の構築
    let whereConditions = ['is_available = true'];
    let queryParams = [];
    let paramIndex = 1;

    if (searchCriteria.type) {
      whereConditions.push(`type = $${paramIndex++}`);
      queryParams.push(searchCriteria.type);
    }

    if (searchCriteria.propertyType && Array.isArray(searchCriteria.propertyType)) {
      const placeholders = searchCriteria.propertyType.map(() => `$${paramIndex++}`).join(', ');
      whereConditions.push(`property_type IN (${placeholders})`);
      queryParams.push(...searchCriteria.propertyType);
    }

    if (searchCriteria.prefecture) {
      whereConditions.push(`prefecture = $${paramIndex++}`);
      queryParams.push(searchCriteria.prefecture);
    }

    if (searchCriteria.city) {
      whereConditions.push(`city ILIKE $${paramIndex++}`);
      queryParams.push(`%${searchCriteria.city}%`);
    }

    if (searchCriteria.station) {
      whereConditions.push(`station ILIKE $${paramIndex++}`);
      queryParams.push(`%${searchCriteria.station}%`);
    }

    if (searchCriteria.minPrice) {
      const priceField = searchCriteria.type === 'rent' ? 'rent' : 'price';
      whereConditions.push(`${priceField} >= $${paramIndex++}`);
      queryParams.push(searchCriteria.minPrice);
    }

    if (searchCriteria.maxPrice) {
      const priceField = searchCriteria.type === 'rent' ? 'rent' : 'price';
      whereConditions.push(`${priceField} <= $${paramIndex++}`);
      queryParams.push(searchCriteria.maxPrice);
    }

    if (searchCriteria.minArea) {
      whereConditions.push(`area >= $${paramIndex++}`);
      queryParams.push(searchCriteria.minArea);
    }

    if (searchCriteria.maxArea) {
      whereConditions.push(`area <= $${paramIndex++}`);
      queryParams.push(searchCriteria.maxArea);
    }

    if (searchCriteria.minRooms) {
      whereConditions.push(`rooms >= $${paramIndex++}`);
      queryParams.push(searchCriteria.minRooms);
    }

    if (searchCriteria.maxRooms) {
      whereConditions.push(`rooms <= $${paramIndex++}`);
      queryParams.push(searchCriteria.maxRooms);
    }

    if (searchCriteria.maxAge) {
      whereConditions.push(`age <= $${paramIndex++}`);
      queryParams.push(searchCriteria.maxAge);
    }

    if (searchCriteria.maxWalkingTime) {
      whereConditions.push(`walking_time <= $${paramIndex++}`);
      queryParams.push(searchCriteria.maxWalkingTime);
    }

    if (searchCriteria.features && Array.isArray(searchCriteria.features)) {
      const featureConditions = searchCriteria.features.map(() => {
        whereConditions.push(`features @> $${paramIndex++}`);
        queryParams.push([searchCriteria.features[paramIndex - 2]]);
      });
    }

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
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    queryParams.push(limit, offset);
    const propertiesResult = await query(propertiesQuery, queryParams);

    const totalPages = Math.ceil(total / limit);

    logger.info('Saved search executed', { 
      userId: req.user.userId, 
      searchId: id,
      resultCount: propertiesResult.rows.length
    });

    res.json({
      success: true,
      data: {
        items: propertiesResult.rows,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        searchCriteria
      }
    });

  } catch (error) {
    logger.error('Saved search execution error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
