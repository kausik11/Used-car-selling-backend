const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const carsRouter = require('./routes/cars');

const app = express();

app.use(express.json({ limit: '2mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1', carsRouter);

app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/used_cars';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error', err);
    process.exit(1);
  });
