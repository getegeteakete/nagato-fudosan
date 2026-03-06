const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// アップロードディレクトリの作成
const uploadDir = 'uploads';
const ensureUploadDir = async () => {
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
};

// ストレージ設定
const storage = multer.memoryStorage();

// ファイルフィルター
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

// アップロード設定
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    files: 10 // 最大10ファイル
  }
});

// 画像リサイズ関数
const resizeImage = async (buffer, width = 1200, height = 800, quality = 80) => {
  try {
    return await sharp(buffer)
      .resize(width, height, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ quality })
      .toBuffer();
  } catch (error) {
    logger.error('Image resize error:', error);
    throw error;
  }
};

// サムネイル生成関数
const generateThumbnail = async (buffer, size = 300) => {
  try {
    return await sharp(buffer)
      .resize(size, size, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer();
  } catch (error) {
    logger.error('Thumbnail generation error:', error);
    throw error;
  }
};

// 単一ファイルアップロード
router.post('/single', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    await ensureUploadDir();

    const fileId = uuidv4();
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `${fileId}${fileExtension}`;
    const thumbnailName = `${fileId}_thumb${fileExtension}`;

    // 画像リサイズ
    const resizedImage = await resizeImage(req.file.buffer);
    const thumbnail = await generateThumbnail(req.file.buffer);

    // ファイル保存
    const filePath = path.join(uploadDir, fileName);
    const thumbnailPath = path.join(uploadDir, thumbnailName);

    await fs.writeFile(filePath, resizedImage);
    await fs.writeFile(thumbnailPath, thumbnail);

    const fileUrl = `/uploads/${fileName}`;
    const thumbnailUrl = `/uploads/${thumbnailName}`;

    logger.info('File uploaded successfully', { 
      fileId, 
      fileName, 
      uploadedBy: req.user.userId 
    });

    res.json({
      success: true,
      data: {
        id: fileId,
        fileName: fileName,
        originalName: req.file.originalname,
        size: resizedImage.length,
        url: fileUrl,
        thumbnailUrl: thumbnailUrl,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('File upload error:', error);
    res.status(500).json({
      success: false,
      error: 'File upload failed'
    });
  }
});

// 複数ファイルアップロード
router.post('/multiple', authenticateToken, requireAdmin, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    await ensureUploadDir();

    const uploadedFiles = [];

    for (const file of req.files) {
      try {
        const fileId = uuidv4();
        const fileExtension = path.extname(file.originalname);
        const fileName = `${fileId}${fileExtension}`;
        const thumbnailName = `${fileId}_thumb${fileExtension}`;

        // 画像リサイズ
        const resizedImage = await resizeImage(file.buffer);
        const thumbnail = await generateThumbnail(file.buffer);

        // ファイル保存
        const filePath = path.join(uploadDir, fileName);
        const thumbnailPath = path.join(uploadDir, thumbnailName);

        await fs.writeFile(filePath, resizedImage);
        await fs.writeFile(thumbnailPath, thumbnail);

        const fileUrl = `/uploads/${fileName}`;
        const thumbnailUrl = `/uploads/${thumbnailName}`;

        uploadedFiles.push({
          id: fileId,
          fileName: fileName,
          originalName: file.originalname,
          size: resizedImage.length,
          url: fileUrl,
          thumbnailUrl: thumbnailUrl,
          uploadedAt: new Date().toISOString()
        });

      } catch (fileError) {
        logger.error('Individual file upload error:', fileError);
        // 個別ファイルのエラーは続行
      }
    }

    if (uploadedFiles.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'All file uploads failed'
      });
    }

    logger.info('Multiple files uploaded', { 
      count: uploadedFiles.length,
      uploadedBy: req.user.userId 
    });

    res.json({
      success: true,
      data: {
        files: uploadedFiles,
        count: uploadedFiles.length
      }
    });

  } catch (error) {
    logger.error('Multiple file upload error:', error);
    res.status(500).json({
      success: false,
      error: 'File upload failed'
    });
  }
});

// ファイル削除
router.delete('/:fileId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { fileId } = req.params;

    // ファイル名の検証
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(fileId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file ID format'
      });
    }

    // ファイル検索
    const files = await fs.readdir(uploadDir);
    const targetFiles = files.filter(file => file.startsWith(fileId));

    if (targetFiles.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // ファイル削除
    for (const file of targetFiles) {
      const filePath = path.join(uploadDir, file);
      await fs.unlink(filePath);
    }

    logger.info('File deleted', { 
      fileId, 
      deletedFiles: targetFiles,
      deletedBy: req.user.userId 
    });

    res.json({
      success: true,
      message: 'File deleted successfully',
      data: {
        deletedFiles: targetFiles
      }
    });

  } catch (error) {
    logger.error('File deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'File deletion failed'
    });
  }
});

// ファイル一覧取得
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    await ensureUploadDir();

    const files = await fs.readdir(uploadDir);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp)$/i.test(file) && !file.includes('_thumb')
    );

    // ファイル情報取得
    const fileInfos = await Promise.all(
      imageFiles.map(async (file) => {
        try {
          const filePath = path.join(uploadDir, file);
          const stats = await fs.stat(filePath);
          const fileId = file.split('.')[0];
          const thumbnailFile = `${fileId}_thumb.${file.split('.').pop()}`;
          
          return {
            id: fileId,
            fileName: file,
            size: stats.size,
            url: `/uploads/${file}`,
            thumbnailUrl: `/uploads/${thumbnailFile}`,
            uploadedAt: stats.birthtime
          };
        } catch (error) {
          logger.error('File info error:', error);
          return null;
        }
      })
    );

    const validFiles = fileInfos.filter(info => info !== null);
    const total = validFiles.length;
    const paginatedFiles = validFiles.slice(offset, offset + parseInt(limit));
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        files: paginatedFiles,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });

  } catch (error) {
    logger.error('File list error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get file list'
    });
  }
});

// 静的ファイル配信
router.use('/uploads', express.static(uploadDir));

module.exports = router;
