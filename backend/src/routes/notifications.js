const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../database/connection');
const { logger } = require('../utils/logger');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// バリデーションルール
const notificationValidation = [
  body('type').isIn(['new_property', 'price_change', 'status_change', 'valuation_result', 'moveout_confirmation']).withMessage('Invalid notification type'),
  body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title is required'),
  body('message').trim().isLength({ min: 1 }).withMessage('Message is required'),
  body('propertyId').optional().isUUID().withMessage('Valid property ID is required')
];

// 通知一覧取得
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE user_id = $1';
    let queryParams = [req.user.userId];
    let paramIndex = 2;

    if (unreadOnly === 'true') {
      whereClause += ` AND is_read = false`;
    }

    // 総件数取得
    const countQuery = `SELECT COUNT(*) FROM notifications ${whereClause}`;
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // 通知一覧取得
    const notificationsQuery = `
      SELECT 
        id, type, title, message, property_id, is_read, created_at
      FROM notifications 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    queryParams.push(limit, offset);
    const notificationsResult = await query(notificationsQuery, queryParams);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        items: notificationsResult.rows,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });

  } catch (error) {
    logger.error('Notifications fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 通知詳細取得
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        id, type, title, message, property_id, is_read, created_at
      FROM notifications
      WHERE id = $1 AND user_id = $2`,
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    logger.error('Notification detail error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 通知を既読にする
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE id = $1 AND user_id = $2 AND is_read = false
       RETURNING id`,
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found or already read'
      });
    }

    logger.info('Notification marked as read', { 
      userId: req.user.userId, 
      notificationId: id
    });

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    logger.error('Notification read error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 全通知を既読にする
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE user_id = $1 AND is_read = false
       RETURNING id`,
      [req.user.userId]
    );

    logger.info('All notifications marked as read', { 
      userId: req.user.userId,
      updatedCount: result.rows.length
    });

    res.json({
      success: true,
      data: {
        updatedCount: result.rows.length
      },
      message: 'All notifications marked as read'
    });

  } catch (error) {
    logger.error('All notifications read error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 通知削除
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    logger.info('Notification deleted', { 
      userId: req.user.userId, 
      notificationId: id
    });

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    logger.error('Notification deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 通知統計取得
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_read = false) as unread,
        COUNT(*) FILTER (WHERE type = 'new_property') as new_property,
        COUNT(*) FILTER (WHERE type = 'price_change') as price_change,
        COUNT(*) FILTER (WHERE type = 'status_change') as status_change,
        COUNT(*) FILTER (WHERE type = 'valuation_result') as valuation_result,
        COUNT(*) FILTER (WHERE type = 'moveout_confirmation') as moveout_confirmation
      FROM notifications 
      WHERE user_id = $1`,
      [req.user.userId]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    logger.error('Notification stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 通知作成（内部API用）
const createNotification = async (userId, notificationData) => {
  try {
    const { type, title, message, propertyId } = notificationData;

    const result = await query(
      `INSERT INTO notifications (user_id, type, title, message, property_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, type, title, message, propertyId]
    );

    logger.info('Notification created', { 
      userId: userId, 
      notificationId: result.rows[0].id,
      type: type
    });

    return result.rows[0];
  } catch (error) {
    logger.error('Notification creation error:', error);
    throw error;
  }
};

// 新着物件通知の作成
const createNewPropertyNotification = async (property, savedSearchUsers) => {
  try {
    const notifications = [];
    
    for (const user of savedSearchUsers) {
      const notification = await createNotification(user.user_id, {
        type: 'new_property',
        title: '新しい物件が追加されました',
        message: `保存された検索条件に一致する物件「${property.title}」が追加されました。`,
        propertyId: property.id
      });
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    logger.error('New property notification creation error:', error);
    throw error;
  }
};

// 価格変更通知の作成
const createPriceChangeNotification = async (property, favoriteUsers) => {
  try {
    const notifications = [];
    
    for (const user of favoriteUsers) {
      const notification = await createNotification(user.user_id, {
        type: 'price_change',
        title: 'お気に入り物件の価格が変更されました',
        message: `お気に入り物件「${property.title}」の価格が変更されました。`,
        propertyId: property.id
      });
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    logger.error('Price change notification creation error:', error);
    throw error;
  }
};

module.exports = {
  router,
  createNotification,
  createNewPropertyNotification,
  createPriceChangeNotification
};
