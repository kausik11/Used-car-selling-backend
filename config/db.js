const mongoose = require('mongoose');

let cachedConnection = null;
let connectionPromise = null;

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/used_cars';

  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose
    .connect(MONGO_URI)
    .then((mongooseInstance) => {
      cachedConnection = mongooseInstance.connection;
      return cachedConnection;
    })
    .finally(() => {
      connectionPromise = null;
    });

  return connectionPromise;
};

module.exports = connectDB;
