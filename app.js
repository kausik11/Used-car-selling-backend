const express = require('express');
const carsRouter = require('./routes/cars');
const reviewsRouter = require('./routes/reviews');
const loveStoriesRouter = require('./routes/loveStories');
const faqsRouter = require('./routes/faqs');
const sellCarsRouter = require('./routes/sellCars');
const testDrivesRouter = require('./routes/testDrives');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const { authMiddleware } = require('./middleware/auth');
const { getProfile } = require('./controllers/authController');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json({ limit: '2mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Vercel health check endpoint
app.get('/api/healthz', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'singh_backend',
    timestamp: new Date().toISOString(),
  });
});

// authentication routes
app.use('/api/auth', authRouter);
app.get('/api/profile', authMiddleware, getProfile);

// car related routes
app.use('/api/v1', carsRouter);
app.use('/api/v1', reviewsRouter);
app.use('/api/v1', loveStoriesRouter);
app.use('/api/v1', faqsRouter);
app.use('/api/v1', sellCarsRouter);
app.use('/api/v1', testDrivesRouter);
app.use('/api/v1', usersRouter);

app.use(errorHandler);

module.exports = app;
