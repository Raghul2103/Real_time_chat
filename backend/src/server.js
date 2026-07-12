import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { socketHandler } from './sockets/socketHandler.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB Database
connectDB();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io server with CORS configuration
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000, // disconnect client after 60s of inactivity
});

// Attach socket event listeners
socketHandler(io);

// Start server
const expressServer = server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Promise Rejection: ${err.message}`);
  // Close server & exit process
  expressServer.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});
