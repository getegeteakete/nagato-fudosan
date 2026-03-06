const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../database/connection');
const { logger } = require('../utils/logger');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

const router = express.Router();

// バリデーションルール
const moveoutValidation = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').trim().isLength({ min: 1 }).withMessage('Phone number is required'),
  body('propertyId').trim().isLength({ min: 1 }).withMessage('Property ID is required'),
  body('roomNumber').trim().isLength({ min: 1 }).withMessage('Room number is required'),
  body('moveoutDate').isISO8601().withMessage('Valid moveout date is required'),
  body('reason').trim().isLength({ min: 1 }).withMessage('Reason is required')
];

// 退去申請一覧取得（管理者のみ）
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
    const countQuery = `SELECT COUNT(*) FROM moveout_requests ${whereClause}`;
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // 退去申請一覧取得
    const requestsQuery = `
      SELECT 
        id, user_id, name, email, phone, property_id, room_number, moveout_date,
        reason, preferred_inspection_date, status, notes, created_at, updated_at
      FROM moveout_requests 
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
    logger.error('Moveout requests fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 退去申請詳細取得（管理者のみ）
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        id, user_id, name, email, phone, property_id, room_number, moveout_date,
        reason, preferred_inspection_date, status, notes, created_at, updated_at
      FROM moveout_requests
      WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Moveout request not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    logger.error('Moveout request detail error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 退去申請作成
router.post('/', moveoutValidation, async (req, res) => {
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
      name, email, phone, propertyId, roomNumber, moveoutDate, reason,
      preferredInspectionDate, notes
    } = req.body;

    // 退去申請作成
    const result = await query(
      `INSERT INTO moveout_requests (
        name, email, phone, property_id, room_number, moveout_date,
        reason, preferred_inspection_date, status, notes
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9
      ) RETURNING *`,
      [name, email, phone, propertyId, roomNumber, moveoutDate, reason, preferredInspectionDate, notes]
    );

    const moveoutRequest = result.rows[0];

    // 確認メール送信
    try {
      await sendEmail({
        to: email,
        subject: '退去申請を受け付けました - Quiet Estate Forge',
        template: 'moveout-confirmation',
        data: {
          name: name,
          requestId: moveoutRequest.id,
          propertyId: propertyId,
          roomNumber: roomNumber,
          moveoutDate: moveoutDate
        }
      });
    } catch (emailError) {
      logger.error('Email sending failed:', emailError);
      // メール送信失敗は退去申請の作成を妨げない
    }

    // 管理者への通知メール送信
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@example.com',
        subject: '新しい退去申請が届きました',
        template: 'moveout-notification',
        data: {
          name: name,
          email: email,
          phone: phone,
          propertyId: propertyId,
          roomNumber: roomNumber,
          moveoutDate: moveoutDate,
          requestId: moveoutRequest.id
        }
      });
    } catch (emailError) {
      logger.error('Admin notification email failed:', emailError);
    }

    logger.info('Moveout request created', { 
      requestId: moveoutRequest.id,
      email: email,
      propertyId: propertyId,
      roomNumber: roomNumber
    });

    res.status(201).json({
      success: true,
      data: moveoutRequest
    });

  } catch (error) {
    logger.error('Moveout request creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 退去申請更新（管理者のみ）
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 退去申請の存在確認
    const existingRequest = await query(
      'SELECT id, email, name FROM moveout_requests WHERE id = $1',
      [id]
    );

    if (existingRequest.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Moveout request not found'
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
      UPDATE moveout_requests 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, updateValues);
    const updatedRequest = result.rows[0];

    // ステータス変更時に顧客にメール送信
    if (updateData.status === 'confirmed') {
      try {
        await sendEmail({
          to: existingRequest.rows[0].email,
          subject: '退去申請が確認されました - Quiet Estate Forge',
          template: 'moveout-confirmed',
          data: {
            name: existingRequest.rows[0].name,
            requestId: id,
            moveoutDate: updatedRequest.moveout_date
          }
        });
      } catch (emailError) {
        logger.error('Moveout confirmation email failed:', emailError);
      }
    } else if (updateData.status === 'completed') {
      try {
        await sendEmail({
          to: existingRequest.rows[0].email,
          subject: '退去手続きが完了しました - Quiet Estate Forge',
          template: 'moveout-completed',
          data: {
            name: existingRequest.rows[0].name,
            requestId: id
          }
        });
      } catch (emailError) {
        logger.error('Moveout completion email failed:', emailError);
      }
    }

    logger.info('Moveout request updated', { 
      requestId: id, 
      updatedBy: req.user.userId,
      status: updateData.status
    });

    res.json({
      success: true,
      data: updatedRequest
    });

  } catch (error) {
    logger.error('Moveout request update error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 退去申請削除（管理者のみ）
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM moveout_requests WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Moveout request not found'
      });
    }

    logger.info('Moveout request deleted', { 
      requestId: id, 
      deletedBy: req.user.userId
    });

    res.json({
      success: true,
      message: 'Moveout request deleted successfully'
    });

  } catch (error) {
    logger.error('Moveout request deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 退去申請統計取得（管理者のみ）
router.get('/stats/summary', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE moveout_date >= CURRENT_DATE) as upcoming,
        COUNT(*) FILTER (WHERE moveout_date < CURRENT_DATE) as overdue
      FROM moveout_requests`
    );

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    logger.error('Moveout stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
