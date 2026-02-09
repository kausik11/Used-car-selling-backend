const mongoose = require('mongoose');
const multer = require('multer');

const errorHandler = (err, req, res, next) => {
  const isMulter = err instanceof multer.MulterError;
  const isMongooseValidation = err instanceof mongoose.Error.ValidationError;
  const isMongooseCast = err instanceof mongoose.Error.CastError;

  const status =
    err.statusCode ||
    (isMulter ? 400 : null) ||
    (isMongooseValidation ? 400 : null) ||
    (isMongooseCast ? 400 : null) ||
    500;

  const message =
    err.message ||
    (isMulter ? 'Invalid upload' : null) ||
    (isMongooseValidation ? 'Validation error' : null) ||
    (isMongooseCast ? 'Invalid identifier' : null) ||
    'Internal Server Error';

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({ error: message });
};

module.exports = errorHandler;
