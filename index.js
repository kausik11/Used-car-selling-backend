require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

// Vercel serverless entrypoint.
module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error', error);
    return res.status(500).json({ error: 'Database connection failed' });
  }
};
