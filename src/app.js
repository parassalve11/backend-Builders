const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const { env } = require('./config/env');
const { publicLimiter } = require('./middlewares/rateLimiter');
const { rejectMongoOperators } = require('./middlewares/sanitizeInput');
const { notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

app.disable('x-powered-by');
if (env.nodeEnv === 'production') app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.frontendUrls.includes(origin)) return callback(null, true);
      const error = new Error('Origin is not allowed by CORS');
      error.statusCode = 403;
      return callback(error);
    },
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  }),
);
app.use(express.json({ limit: '100kb', strict: true }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));
app.use(rejectMongoOperators);
if (env.nodeEnv !== 'test') {
  morgan.token('safe-path', (req) => `${req.baseUrl || ''}${req.path || ''}`);
  app.use(morgan(':method :safe-path :status :response-time ms - :res[content-length]'));
}
app.use('/api', publicLimiter, routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
