const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const foodRoutes = require('./routes/food');
const orderRoutes = require('./routes/orders');
const analyticsRoutes = require('./routes/analytics');
const paymentRoutes = require('./routes/payment');
const canteenRoutes = require('./routes/canteens');
const inventoryRoutes = require('./routes/inventory');
const recipeRoutes = require('./routes/recipes');
const invitationRoutes = require('./routes/invitations');
const feedbackRoutes = require('./routes/feedback');
const auditLogRoutes = require('./routes/auditLogs');
const webhookRoutes = require('./routes/webhook');
const categoryRoutes = require('./routes/categories');
const homepageRoutes = require('./routes/homepage');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  },
});

// Attach socket.io instance to app for routes
app.set('socketio', io);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Database Connection
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/canteens', canteenRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/homepage', homepageRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Smart Campus Canteen API',
  });
});

// Socket.IO event handling
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Client can join a dedicated order room to receive personal order updates
  socket.on('join:order', (orderId) => {
    socket.join(`order:${orderId}`);
    console.log(`[Socket.IO] Client ${socket.id} joined room order:${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Serve frontend static files if built in client/dist
const distPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/socket.io')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('Smart Campus Canteen API is running. Frontend dev server is on port 5173.');
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Smart Campus Canteen Server is running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}/api`);
  console.log(`🔔 Socket.IO real-time token system active`);
  console.log(`=======================================================`);
});
