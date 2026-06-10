import multer from 'multer';

// Use memory storage — buffers get streamed directly to Cloudinary
const storage = multer.memoryStorage();

export const uploadMovieFiles = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB max per file
  fileFilter(_req, file, cb) {
    if (file.fieldname === 'poster' && !file.mimetype.startsWith('image/')) {
      return cb(new Error('Poster must be an image file'));
    }
    if (file.fieldname === 'video' && !file.mimetype.startsWith('video/')) {
      return cb(new Error('Video must be a video file'));
    }
    cb(null, true);
  },
}).fields([
  { name: 'poster', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]);

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter(_req, file, cb) {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Must be an image'));
    cb(null, true);
  },
}).single('avatar');
