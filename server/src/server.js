import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import siteRoutes from './routes/site.routes.js';
import taskRoutes from './routes/task.routes.js';
import fileRoutes from './routes/file.routes.js';
import userRoutes from './routes/user.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.resolve(__dirname, '../../frontend/dist');

const app = express();

// ✅ Support multiple origins from .env (comma separated) + local dev defaults
const defaultDevOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080'
];

const envOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map(origin => origin.trim().replace(/\/$/, ''))
  : [];

const allowedOrigins = Array.from(new Set([...defaultDevOrigins, ...envOrigins]));

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/$/, '');
      const isAllowed =
        allowedOrigins.includes(cleanOrigin) ||
        allowedOrigins.includes('*') ||
        (cleanOrigin.endsWith('.vercel.app') && allowedOrigins.some(o => o.includes('vercel.app')));

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Request blocked from origin: ${origin}`);
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
  })
);

app.use(morgan('dev'));
app.use(express.json());

// 🚀 Disable caching for all API responses
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store'); // always fetch new data
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/users', userRoutes);

// Serve frontend static files if built
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Construction Tracker API',
      status: 'running',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        sites: '/api/sites',
        tasks: '/api/tasks',
        files: '/api/files',
        users: '/api/users'
      }
    });
  });
}

// 404 handler for unmatched API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ message: `API endpoint ${req.originalUrl} not found` });
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error('DB connection failed', err);
    process.exit(1);
  });




