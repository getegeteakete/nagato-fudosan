const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const userRoutes = require('./routes/users');
const favoriteRoutes = require('./routes/favorites');
const searchRoutes = require('./routes/searches');
const notificationRoutes = require('./routes/notifications');
const valuationRoutes = require('./routes/valuation');
const moveoutRoutes = require('./routes/moveout');
const uploadRoutes = require('./routes/upload');

const { errorHandler } = require('./middleware/errorHandler');
const { logger } = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3001;

// セキュリティミドルウェア
app.use(helmet());

// CORS設定
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// レート制限
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // リクエスト制限
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// ログ設定
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// 圧縮
app.use(compression());

// ボディパーサー
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ヘルスチェック
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API ルート
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/saved-searches', searchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/valuation-requests', valuationRoutes);
app.use('/api/moveout-requests', moveoutRoutes);
app.use('/api/upload', uploadRoutes);

// 404 ハンドラー
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found' 
  });
});

// エラーハンドラー
app.use(errorHandler);

// サーバー起動
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// グレースフルシャットダウン
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
