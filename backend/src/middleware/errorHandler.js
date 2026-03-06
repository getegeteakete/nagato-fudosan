const { logger } = require('../utils/logger');

// エラーハンドリングミドルウェア
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // ログ出力
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // PostgreSQL エラー
  if (err.code) {
    switch (err.code) {
      case '23505': // 一意制約違反
        error.message = 'Duplicate entry';
        error.statusCode = 409;
        break;
      case '23503': // 外部キー制約違反
        error.message = 'Referenced record not found';
        error.statusCode = 400;
        break;
      case '23502': // NOT NULL制約違反
        error.message = 'Required field is missing';
        error.statusCode = 400;
        break;
      case '42P01': // テーブルが存在しない
        error.message = 'Database table not found';
        error.statusCode = 500;
        break;
      default:
        error.message = 'Database error';
        error.statusCode = 500;
    }
  }

  // JWT エラー
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.statusCode = 401;
  }

  // バリデーションエラー
  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors).map(val => val.message).join(', ');
    error.statusCode = 400;
  }

  // キャストエラー
  if (err.name === 'CastError') {
    error.message = 'Invalid ID format';
    error.statusCode = 400;
  }

  // デフォルトエラー
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler };
