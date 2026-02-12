const express = require('express');
const carsRouter = require('./routes/cars');
const reviewsRouter = require('./routes/reviews');
const loveStoriesRouter = require('./routes/loveStories');
const faqsRouter = require('./routes/faqs');
const sellCarsRouter = require('./routes/sellCars');
const testDrivesRouter = require('./routes/testDrives');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json({ limit: '2mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// car related routes
app.use('/api/v1', carsRouter);
app.use('/api/v1', reviewsRouter);
app.use('/api/v1', loveStoriesRouter);
app.use('/api/v1', faqsRouter);
app.use('/api/v1', sellCarsRouter);
app.use('/api/v1', testDrivesRouter);

app.use(errorHandler);

module.exports = app;
