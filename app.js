const express = require('express');
const carsRouter = require('./routes/cars');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json({ limit: '2mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// car related routs
app.use('/api/v1', carsRouter);

app.use(errorHandler);

module.exports = app;
