const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../database/connection');
const { logger } = require('../utils/logger');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

const router = express.Router();

// バリデーションルール
const valuationValidation = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').trim().isLength({ min: 1 }).withMessage('Phone number is required'),
  body('propertyType').isIn(['apartment', 'house', 'land']).withMessage('Invalid property type'),
  body('address').trim().isLength({ min: 1 }).withMessage('Address is required'),
  body('area').isFloat({ min: 0 }).withMessage('Area must be a positive number'),
  body('age').isInt({ min: 0 }).withMessage('Age must be a non-negative integer'),
  body('condition').isIn(['excellent', 'good', 'fair', 'poor']).withMessage('Invalid condition')
];

// 査定依頼一覧取得（管理者のみ）
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let queryParams = [];
    let paramIndex = 1;

    if (status) {
      whereClause = `WHERE status = $${paramIndex++}`;
      queryParams.push(status);
    }

    // 総件数取得
    const countQuery = `SELECT COUNT(*) FROM valuation_requests ${whereClause}`;
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // 査定依頼一覧取得
    const requestsQuery = `
      SELECT 
        id, name, email, phone, property_type, address, area, age, floor, rooms,
        condition, features, estimated_price, status, notes, created_at, updated_at
      FROM valuation_requests 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    queryParams.push(limit, offset);
    const requestsResult = await query(requestsQuery, queryParams);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        items: requestsResult.rows,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });

  } catch (error) {
    logger.error('Valuation requests fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 査定依頼詳細取得（管理者のみ）
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        id, name, email, phone, property_type, address, area, age, floor, rooms,
        condition, features, estimated_price, status, notes, created_at, updated_at
      FROM valuation_requests
      WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Valuation request not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    logger.error('Valuation request detail error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 査定依頼作成
router.post('/', valuationValidation, async (req, res) => {
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
      name, email, phone, propertyType, address, area, age, floor, rooms,
      condition, features, notes
    } = req.body;

    // 査定依頼作成
    const result = await query(
      `INSERT INTO valuation_requests (
        name, email, phone, property_type, address, area, age, floor, rooms,
        condition, features, status, notes
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', $12
      ) RETURNING *`,
      [name, email, phone, propertyType, address, area, age, floor, rooms, condition, features, notes]
    );

    const valuationRequest = result.rows[0];

    // 確認メール送信
    try {
      await sendEmail({
        to: email,
        subject: '査定依頼を受け付けました - Quiet Estate Forge',
        template: 'valuation-confirmation',
        data: {
          name: name,
          requestId: valuationRequest.id,
          propertyType: propertyType,
          address: address
        }
      });
    } catch (emailError) {
      logger.error('Email sending failed:', emailError);
      // メール送信失敗は査定依頼の作成を妨げない
    }

    // 管理者への通知メール送信
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@example.com',
        subject: '新しい査定依頼が届きました',
        template: 'valuation-notification',
        data: {
          name: name,
          email: email,
          phone: phone,
          propertyType: propertyType,
          address: address,
          requestId: valuationRequest.id
        }
      });
    } catch (emailError) {
      logger.error('Admin notification email failed:', emailError);
    }

    logger.info('Valuation request created', { 
      requestId: valuationRequest.id,
      email: email,
      propertyType: propertyType
    });

    res.status(201).json({
      success: true,
      data: valuationRequest
    });

  } catch (error) {
    logger.error('Valuation request creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 査定依頼更新（管理者のみ）
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 査定依頼の存在確認
    const existingRequest = await query(
      'SELECT id, email, name FROM valuation_requests WHERE id = $1',
      [id]
    );

    if (existingRequest.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Valuation request not found'
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
      UPDATE valuation_requests 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, updateValues);
    const updatedRequest = result.rows[0];

    // 査定完了時に顧客にメール送信
    if (updateData.status === 'completed' && updateData.estimatedPrice) {
      try {
        await sendEmail({
          to: existingRequest.rows[0].email,
          subject: '査定結果のご報告 - Quiet Estate Forge',
          template: 'valuation-result',
          data: {
            name: existingRequest.rows[0].name,
            estimatedPrice: updateData.estimatedPrice,
            requestId: id
          }
        });
      } catch (emailError) {
        logger.error('Valuation result email failed:', emailError);
      }
    }

    logger.info('Valuation request updated', { 
      requestId: id, 
      updatedBy: req.user.userId,
      status: updateData.status
    });

    res.json({
      success: true,
      data: updatedRequest
    });

  } catch (error) {
    logger.error('Valuation request update error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 査定依頼削除（管理者のみ）
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM valuation_requests WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Valuation request not found'
      });
    }

    logger.info('Valuation request deleted', { 
      requestId: id, 
      deletedBy: req.user.userId
    });

    res.json({
      success: true,
      message: 'Valuation request deleted successfully'
    });

  } catch (error) {
    logger.error('Valuation request deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 査定統計取得（管理者のみ）
router.get('/stats/summary', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE property_type = 'apartment') as apartment,
        COUNT(*) FILTER (WHERE property_type = 'house') as house,
        COUNT(*) FILTER (WHERE property_type = 'land') as land,
        AVG(estimated_price) FILTER (WHERE estimated_price IS NOT NULL) as avg_price
      FROM valuation_requests`
    );

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    logger.error('Valuation stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
