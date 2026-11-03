const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createStorage = (folder) => {
  const uploadPath = path.join(__dirname, '../uploads', folder);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });
};

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) return cb(null, true);
  cb(new Error('Only image files are allowed!'));
};

const uploadOptions = { fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }; // 5MB

const uploadRestaurant = multer({ storage: createStorage('restaurants'), ...uploadOptions });
const uploadFood = multer({ storage: createStorage('foods'), ...uploadOptions });
const uploadCategory = multer({ storage: createStorage('categories'), ...uploadOptions });
const uploadUser = multer({ storage: createStorage('users'), ...uploadOptions });

module.exports = { uploadRestaurant, uploadFood, uploadCategory, uploadUser };
