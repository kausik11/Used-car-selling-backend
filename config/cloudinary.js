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
    const rootFolder = `used_cars/${car_id}`;

    // Map image uploads into subfolders:
    // used_cars/<car_id>/gallery
    // used_cars/<car_id>/exterior_360
    // used_cars/<car_id>/interior_360
    if (!req._carImageUploadIndex) {
      req._carImageUploadIndex = 0;
    }

    let imageFolder = 'gallery';
    if (file.fieldname === 'images') {
      const imageIndex = req._carImageUploadIndex;
      req._carImageUploadIndex += 1;
      const rawViewType = req.body?.[`images_view_type_${imageIndex}`];
      const normalizedViewType = String(rawViewType || 'gallery').trim().toLowerCase();
      if (['gallery', 'exterior_360', 'interior_360'].includes(normalizedViewType)) {
        imageFolder = normalizedViewType;
      }
    }

    return {
      folder: isReport ? `${rootFolder}/inspection_report` : `${rootFolder}/${imageFolder}`,
      resource_type: isReport ? 'raw' : 'image',
      public_id: `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
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

const sellCarStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: `sell_cars/${req.params.sell_car_id || 'new'}`,
    resource_type: 'image',
    public_id: `${file.fieldname}-${Date.now()}`,
  }),
});

const sellCarAllowedFields = new Set(['front', 'back', 'interior', 'odometer']);

const sellCarFileFilter = (req, file, cb) => {
  if (!sellCarAllowedFields.has(file.fieldname)) {
    return cb(null, false);
  }
  return cb(null, true);
};

const sellCarUpload = multer({ storage: sellCarStorage, fileFilter: sellCarFileFilter });

module.exports = {
  cloudinary,
  upload,
  allowedFileFields,
  sellCarUpload,
  sellCarAllowedFields,
};
