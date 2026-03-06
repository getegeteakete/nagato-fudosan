const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../database/connection');
const { logger } = require('../utils/logger');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// バリデーションルール
const favoriteValidation = [
  body('propertyId').isUUID().withMessage('Valid property ID is required')
];

// お気に入り一覧取得
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        p.id, p.title, p.description, p.type, p.property_type, p.price, p.rent, 
        p.management_fee, p.deposit, p.key_money, p.area, p.rooms, p.floor, 
        p.total_floors, p.age, p.address, p.prefecture, p.city, p.station, 
        p.walking_time, p.features, p.images, p.is_available, p.is_new, 
        p.created_at, p.updated_at, f.created_at as favorited_at
      FROM favorites f
      JOIN properties p ON f.property_id = p.id
      WHERE f.user_id = $1 AND p.is_available = true
      ORDER BY f.created_at DESC`,
      [req.user.userId]
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    logger.error('Favorites fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// お気に入り追加
router.post('/', authenticateToken, favoriteValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { propertyId } = req.body;

    // 物件の存在確認
    const propertyResult = await query(
      'SELECT id, title FROM properties WHERE id = $1 AND is_available = true',
      [propertyId]
    );

    if (propertyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Property not found or not available'
      });
    }

    // 既にお気に入りに追加されているかチェック
    const existingFavorite = await query(
      'SELECT id FROM favorites WHERE user_id = $1 AND property_id = $2',
      [req.user.userId, propertyId]
    );

    if (existingFavorite.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Property already in favorites'
      });
    }

    // お気に入り追加
    const result = await query(
      'INSERT INTO favorites (user_id, property_id) VALUES ($1, $2) RETURNING *',
      [req.user.userId, propertyId]
    );

    logger.info('Favorite added', { 
      userId: req.user.userId, 
      propertyId: propertyId,
      propertyTitle: propertyResult.rows[0].title
    });

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    logger.error('Favorite addition error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// お気に入り削除
router.delete('/:propertyId', authenticateToken, async (req, res) => {
  try {
    const { propertyId } = req.params;

    // お気に入りの存在確認
    const existingFavorite = await query(
      'SELECT id FROM favorites WHERE user_id = $1 AND property_id = $2',
      [req.user.userId, propertyId]
    );

    if (existingFavorite.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Favorite not found'
      });
    }

    // お気に入り削除
    await query(
      'DELETE FROM favorites WHERE user_id = $1 AND property_id = $2',
      [req.user.userId, propertyId]
    );

    logger.info('Favorite removed', { 
      userId: req.user.userId, 
      propertyId: propertyId
    });

    res.json({
      success: true,
      message: 'Favorite removed successfully'
    });

  } catch (error) {
    logger.error('Favorite removal error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// お気に入り状態確認
router.get('/check/:propertyId', authenticateToken, async (req, res) => {
  try {
    const { propertyId } = req.params;

    const result = await query(
      'SELECT id FROM favorites WHERE user_id = $1 AND property_id = $2',
      [req.user.userId, propertyId]
    );

    res.json({
      success: true,
      data: {
        isFavorite: result.rows.length > 0
      }
    });

  } catch (error) {
    logger.error('Favorite check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// お気に入り一括削除
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const { propertyIds } = req.body;

    if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Property IDs array is required'
      });
    }

    // バリデーション
    const invalidIds = propertyIds.filter(id => !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid property IDs format'
      });
    }

    // 一括削除
    const placeholders = propertyIds.map((_, index) => `$${index + 2}`).join(', ');
    const queryParams = [req.user.userId, ...propertyIds];
    
    const result = await query(
      `DELETE FROM favorites 
       WHERE user_id = $1 AND property_id IN (${placeholders})
       RETURNING property_id`,
      queryParams
    );

    logger.info('Favorites bulk removed', { 
      userId: req.user.userId, 
      removedCount: result.rows.length,
      propertyIds: propertyIds
    });

    res.json({
      success: true,
      data: {
        removedCount: result.rows.length,
        removedPropertyIds: result.rows.map(row => row.property_id)
      }
    });

  } catch (error) {
    logger.error('Favorites bulk removal error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
