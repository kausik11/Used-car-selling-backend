const { v2: cloudinary } = require('cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const { car_id } = req.params;
    const isReport = file.fieldname === 'inspection_report';
    return {
      folder: `used_cars/${car_id}`,
      resource_type: isReport ? 'raw' : 'image',
      public_id: `${file.fieldname}-${Date.now()}`,
    };
  },
});

const allowedFileFields = new Set(['images', 'inspection_report']);

const fileFilter = (req, file, cb) => {
  if (!allowedFileFields.has(file.fieldname)) {
    return cb(null, false);
  }
  return cb(null, true);
};

const upload = multer({ storage, fileFilter });

module.exports = { cloudinary, upload, allowedFileFields };
