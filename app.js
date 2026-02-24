const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const carsRouter = require('./routes/cars');
const reviewsRouter = require('./routes/reviews');
const loveStoriesRouter = require('./routes/loveStories');
const faqsRouter = require('./routes/faqs');
const sellCarsRouter = require('./routes/sellCars');
const testDrivesRouter = require('./routes/testDrives');
const callbackRequestsRouter = require('./routes/callbackRequests');
const newsletterRoutes = require('./routes/newsletter');
const testimonialRoutes = require('./routes/testimonials');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const { verifyJWT } = require('./middleware/verifyJWT');
const { me } = require('./controllers/authController');
const errorHandler = require('./middleware/errorHandler');

const app = express();
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const defaultAllowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'https://used-car-selling-admin.vercel.app'];
const envAllowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = envAllowedOrigins.length > 0 ? envAllowedOrigins : defaultAllowedOrigins;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Singh backend is running',
    health: '/api/healthz',
  });
});

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
app.use('/api/auth', authLimiter, authRouter);
app.get('/api/profile', verifyJWT, me);

// car related routes
app.use('/api/v1', carsRouter);
app.use('/api/v1', reviewsRouter);
app.use('/api/v1', loveStoriesRouter);
app.use('/api/v1', faqsRouter);
app.use('/api/v1', sellCarsRouter);
app.use('/api/v1', testDrivesRouter);
app.use('/api/v1', callbackRequestsRouter);
app.use('/api/v1', usersRouter);
app.use('/api/v1/newsletter', newsletterRoutes);
app.use('/api/v1/testimonials', testimonialRoutes);

app.use(errorHandler);

module.exports = app;
