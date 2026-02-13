const express = require('express');
const cors = require('cors');
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

const defaultAllowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
const envAllowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = envAllowedOrigins.length > 0 ? envAllowedOrigins : defaultAllowedOrigins;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
  })
);

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
