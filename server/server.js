import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedMongoIfEmpty } from './services/dataStore.js';
import stallRoutes from './routes/stallRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Attach io instance to express app so controllers can emit events
app.set('io', io);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/stalls', stallRoutes);
app.use('/api/orders', orderRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Kirbite API (Campus Food Delivery)',
    time: new Date().toISOString(),
  });
});

// Socket.io event handling
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // Vendor joins their stall room for real-time notifications
  socket.on('join_stall', (stallId) => {
    if (stallId) {
      socket.join(stallId.toString());
      console.log(`[Socket.io] Socket ${socket.id} joined stall room: ${stallId}`);
    }
  });

  // Customer joins specific order room to track status live
  socket.on('join_order', (orderId) => {
    if (orderId) {
      const room = `order_${orderId}`;
      socket.join(room);
      console.log(`[Socket.io] Socket ${socket.id} joined order tracking room: ${room}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Start Server
const startServer = async () => {
  await connectDB();
  await seedMongoIfEmpty();

  server.listen(PORT, () => {
    console.log(`🚀 Kirbite Backend Server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.io server ready for vendor and customer real-time events.`);
  });
};

startServer();
