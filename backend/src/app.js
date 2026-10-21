const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const config = require('./config');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimit');

const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use('/uploads', express.static(config.uploadsDir, { maxAge: '1h', setHeaders: (res) => res.set('X-Content-Type-Options', 'nosniff') }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
if (config.env !== 'test') app.use(morgan('dev'));
app.use('/api', apiLimiter, routes);
app.use((req, res) => res.status(404).json({ ok: false, code: 'NOT_FOUND', message: 'No such route' }));
app.use(errorHandler);

module.exports = app;
