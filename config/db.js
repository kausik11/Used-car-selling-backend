const mongoose = require('mongoose');

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/used_cars';
  await mongoose.connect(MONGO_URI);
};

module.exports = connectDB;
