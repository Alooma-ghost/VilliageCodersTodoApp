const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    appName: 'Village Coders Todo API',
    message: 'Backend server is running smoothly on Render',
    health: '/api/health',
    endpoints: {
      auth: '/api/auth',
      tasks: '/api/tasks',
      health: '/api/health',
    },
    time: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'Village Coders Todo API',
    time: new Date().toISOString(),
  });
});

// 404 handler (prevents Express default HTML 404 that injects Content-Security-Policy: default-src 'none')
app.use((req, res) => {
  res.status(404).json({
    success: false,
    status: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Village Coders Server running on port ${PORT}`);
});
