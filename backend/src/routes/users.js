const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../database/connection');
const { logger } = require('../utils/logger');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// バリデーションルール
const userUpdateValidation = [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
  body('phone').optional().isMobilePhone('ja-JP').withMessage('Invalid phone number'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Invalid email')
];

const preferencesValidation = [
  body('notificationEmail').optional().isBoolean().withMessage('Notification email must be boolean'),
  body('notificationLine').optional().isBoolean().withMessage('Notification line must be boolean'),
  body('lineUserId').optional().trim().isLength({ min: 1 }).withMessage('Line user ID is required'),
  body('preferredAreas').optional().isArray().withMessage('Preferred areas must be array'),
  body('preferredPropertyTypes').optional().isArray().withMessage('Preferred property types must be array'),
  body('maxPrice').optional().isInt({ min: 0 }).withMessage('Max price must be positive integer'),
  body('minArea').optional().isFloat({ min: 0 }).withMessage('Min area must be positive number')
];

// ユーザープロフィール取得
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        u.id, u.email, u.name, u.phone, u.role, u.is_active, u.email_verified,
        u.created_at, u.updated_at,
        up.notification_email, up.notification_line, up.line_user_id,
        up.preferred_areas, up.preferred_property_types, up.max_price, up.min_area
      FROM users u
      LEFT JOIN user_preferences up ON u.id = up.user_id
      WHERE u.id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        preferences: {
          notificationEmail: user.notification_email,
          notificationLine: user.notification_line,
          lineUserId: user.line_user_id,
          preferredAreas: user.preferred_areas,
          preferredPropertyTypes: user.preferred_property_types,
          maxPrice: user.max_price,
          minArea: user.min_area
        }
      }
    });

  } catch (error) {
    logger.error('User profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ユーザープロフィール更新
router.put('/profile', authenticateToken, userUpdateValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const updateData = req.body;
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

    updateValues.push(req.user.userId);
    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING id, email, name, phone, role, is_active, email_verified, created_at, updated_at
    `;

    const result = await query(updateQuery, updateValues);

    logger.info('User profile updated', { 
      userId: req.user.userId,
      updatedFields: Object.keys(updateData)
    });

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    logger.error('User profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ユーザー設定更新
router.put('/preferences', authenticateToken, preferencesValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const preferencesData = req.body;

    // 既存の設定を確認
    const existingPrefs = await query(
      'SELECT id FROM user_preferences WHERE user_id = $1',
      [req.user.userId]
    );

    let result;

    if (existingPrefs.rows.length > 0) {
      // 更新
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      Object.keys(preferencesData).forEach(key => {
        if (preferencesData[key] !== undefined) {
          updateFields.push(`${key} = $${paramIndex++}`);
          updateValues.push(preferencesData[key]);
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No preferences to update'
        });
      }

      updateValues.push(req.user.userId);
      const updateQuery = `
        UPDATE user_preferences 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $${paramIndex}
        RETURNING *
      `;

      result = await query(updateQuery, updateValues);
    } else {
      // 新規作成
      const insertFields = ['user_id'];
      const insertValues = [req.user.userId];
      const placeholders = ['$1'];
      let paramIndex = 2;

      Object.keys(preferencesData).forEach(key => {
        if (preferencesData[key] !== undefined) {
          insertFields.push(key);
          insertValues.push(preferencesData[key]);
          placeholders.push(`$${paramIndex++}`);
        }
      });

      const insertQuery = `
        INSERT INTO user_preferences (${insertFields.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING *
      `;

      result = await query(insertQuery, insertValues);
    }

    logger.info('User preferences updated', { 
      userId: req.user.userId,
      updatedFields: Object.keys(preferencesData)
    });

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    logger.error('User preferences update error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ユーザー一覧取得（管理者のみ）
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, isActive } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (role) {
      whereConditions.push(`role = $${paramIndex++}`);
      queryParams.push(role);
    }

    if (isActive !== undefined) {
      whereConditions.push(`is_active = $${paramIndex++}`);
      queryParams.push(isActive === 'true');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // 総件数取得
    const countQuery = `SELECT COUNT(*) FROM users ${whereClause}`;
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // ユーザー一覧取得
    const usersQuery = `
      SELECT 
        id, email, name, phone, role, is_active, email_verified, created_at, updated_at
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    queryParams.push(limit, offset);
    const usersResult = await query(usersQuery, queryParams);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        items: usersResult.rows,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });

  } catch (error) {
    logger.error('Users fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ユーザー詳細取得（管理者のみ）
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        u.id, u.email, u.name, u.phone, u.role, u.is_active, u.email_verified,
        u.created_at, u.updated_at,
        up.notification_email, up.notification_line, up.line_user_id,
        up.preferred_areas, up.preferred_property_types, up.max_price, up.min_area
      FROM users u
      LEFT JOIN user_preferences up ON u.id = up.user_id
      WHERE u.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        preferences: {
          notificationEmail: user.notification_email,
          notificationLine: user.notification_line,
          lineUserId: user.line_user_id,
          preferredAreas: user.preferred_areas,
          preferredPropertyTypes: user.preferred_property_types,
          maxPrice: user.max_price,
          minArea: user.min_area
        }
      }
    });

  } catch (error) {
    logger.error('User detail fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ユーザー更新（管理者のみ）
router.put('/:id', authenticateToken, requireAdmin, userUpdateValidation, async (req, res) => {
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

    // 自分自身のロール変更は禁止
    if (id === req.user.userId && updateData.role) {
      return res.status(403).json({
        success: false,
        error: 'Cannot change your own role'
      });
    }

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
      UPDATE users 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING id, email, name, phone, role, is_active, email_verified, created_at, updated_at
    `;

    const result = await query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    logger.info('User updated by admin', { 
      userId: id,
      updatedBy: req.user.userId,
      updatedFields: Object.keys(updateData)
    });

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    logger.error('User update error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ユーザー削除（管理者のみ）
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // 自分自身の削除は禁止
    if (id === req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }

    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id, email',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    logger.info('User deleted by admin', { 
      deletedUserId: id,
      deletedBy: req.user.userId,
      deletedUserEmail: result.rows[0].email
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    logger.error('User deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ユーザー統計取得（管理者のみ）
router.get('/stats/summary', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE role = 'user') as users,
        COUNT(*) FILTER (WHERE role = 'admin') as admins,
        COUNT(*) FILTER (WHERE is_active = true) as active,
        COUNT(*) FILTER (WHERE is_active = false) as inactive,
        COUNT(*) FILTER (WHERE email_verified = true) as verified,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_30d,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_users_7d
      FROM users`
    );

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    logger.error('User stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
