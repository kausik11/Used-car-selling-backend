require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    // eslint-disable-next-line no-console
    console.log('MongoDB connected');

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error', error);
    process.exit(1);
  }
};

startServer();
