const mongoose = require('mongoose');
const multer = require('multer');

const errorHandler = (err, req, res, next) => {
  const isMulter = err instanceof multer.MulterError;
  const isMongooseValidation = err instanceof mongoose.Error.ValidationError;
  const isMongooseCast = err instanceof mongoose.Error.CastError;
  const isDuplicateKey = err && err.code === 11000;

  const status =
    err.statusCode ||
    (isMulter ? 400 : null) ||
    (isMongooseValidation ? 400 : null) ||
    (isMongooseCast ? 400 : null) ||
    (isDuplicateKey ? 409 : null) ||
    500;

  const message =
    err.message ||
    (isMulter ? 'Invalid upload' : null) ||
    (isMongooseValidation ? 'Validation error' : null) ||
    (isMongooseCast ? 'Invalid identifier' : null) ||
    (isDuplicateKey ? 'Duplicate value violates unique constraint' : null) ||
    'Internal Server Error';

  if (isMongooseValidation) {
    const details = Object.values(err.errors || {})
      .map((item) => ({
        field: item.path,
        message: item.message,
        kind: item.kind,
      }))
      .filter((item) => item.field || item.message);

    return res.status(400).json({
      error: 'Validation error',
      message,
      details,
    });
  }

  if (isMongooseCast) {
    return res.status(400).json({
      error: 'Invalid value',
      message,
      field: err.path,
      value: err.value,
    });
  }

  if (isDuplicateKey) {
    const duplicateFields = err.keyValue ? Object.keys(err.keyValue) : [];
    return res.status(409).json({
      error: 'Duplicate value',
      message,
      fields: duplicateFields,
    });
  }

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({ error: message });
};

module.exports = errorHandler;
