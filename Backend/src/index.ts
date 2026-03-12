import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import portfolioRoutes from './routes/portfolioRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

// ─── Middleware ───
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      /\.vercel\.app$/,          // any *.vercel.app preview/production URL
      process.env.FRONTEND_URL,  // set this in Railway to your exact Vercel domain
    ].filter(Boolean) as (string | RegExp)[],
    methods: ['GET', 'POST'],
    credentials: true,
  })
);
app.use(express.json());

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// ─── Routes ───
app.use('/api', portfolioRoutes);

// Root route
app.get('/', (_req, res) => {
  res.json({
    name: 'Portfolio Dashboard API',
    version: '1.0.0',
    endpoints: {
      portfolio: 'GET /api/portfolio - Full enriched portfolio with live data',
      holdings: 'GET /api/holdings - Static holdings data only',
      refresh: 'POST /api/refresh - Force refresh all data',
      cacheStats: 'GET /api/cache-stats - Cache statistics',
      health: 'GET /api/health - Health check',
    },
  });
});

// ─── Error Handling ───
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ───
app.listen(PORT, () => {
  console.log(`\n🚀 Portfolio Dashboard API running on http://localhost:${PORT}`);
  console.log(`📊 Portfolio endpoint: http://localhost:${PORT}/api/portfolio`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

export default app;
