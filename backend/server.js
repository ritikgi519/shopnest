// 1. DNS setup (safe fallback)
try {
  const dns = require('dns');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore DNS setServers error in restricted container environments
}

// 2. Imports
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// 3. Load environment variables
[
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '.env'),
  path.resolve(__dirname, '../.env.local'),
  path.resolve(__dirname, '../.env.example'),
].forEach((envPath) => {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
});

// Ensure default JWT secret for testing/preview
process.env.JWT_SECRET = process.env.JWT_SECRET || 'shopnest_default_jwt_secret_key_2026';

// 4. Connect to Database (graceful failover if Mongo not available)
const connectDB = require('./config/db');
connectDB();

const app = express();

// CORS
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Database offline graceful fallback middleware per migration specs
app.use((err, req, res, next) => {
  if (err.name === 'MongooseError' || err.name === 'MongoNetworkError' || (err.message && err.message.includes('buffering timed out'))) {
    console.warn('[AI Studio] Database offline — returning fallback response');
    if (req.method === 'GET') {
      return res.json(req.path.endsWith('s') || req.path.endsWith('s/') ? [] : {});
    }
    return res.status(503).json({ error: 'Service temporarily unavailable (database offline)' });
  }
  next(err);
});

// Serve frontend build (supports both build and dist directories)
const possibleFrontendPaths = [
  path.resolve(__dirname, '../frontend/build'),
  path.resolve(__dirname, '../frontend/dist')
];
let frontendBuildDir = possibleFrontendPaths.find(p => fs.existsSync(p));
if (!frontendBuildDir) {
  try {
    console.log('[ShopNest] Frontend build missing, building now...');
    const { execSync } = require('child_process');
    execSync('npm run build:frontend', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
    frontendBuildDir = possibleFrontendPaths.find(p => fs.existsSync(p)) || possibleFrontendPaths[0];
  } catch (e) {
    console.error('[ShopNest] Failed to auto-build frontend:', e.message);
    frontendBuildDir = possibleFrontendPaths[0];
  }
}

app.use(express.static(frontendBuildDir));

// Fallback for SPA navigation
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const indexPath = path.join(frontendBuildDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  next();
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://0.0.0.0:${PORT}`));