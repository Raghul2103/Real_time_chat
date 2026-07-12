import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';

// Parse cookie helper for socket handshake
const parseCookies = (cookieString) => {
  if (!cookieString) return {};
  return cookieString.split(';').reduce((acc, curr) => {
    const parts = curr.trim().split('=');
    const key = parts[0];
    const val = parts.slice(1).join('='); // handle values that might contain '='
    acc[key] = val;
    return acc;
  }, {});
};

export const socketAuth = async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;
    const cookies = parseCookies(cookieHeader);
    const token = cookies.jwt;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'chat_app_jwt_secret_dev_key_123456789');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.user = user;
    next();
  } catch (error) {
    console.error('Socket authentication failed:', error.message);
    next(new Error('Authentication error: Invalid token'));
  }
};

export const socketHandler = (io) => {
  io.use(socketAuth);

  io.on('connection', async (socket) => {
    const user = socket.user;
    console.log(`User connected: ${user.name} (${socket.id})`);

    try {
      // 1. Update user online status and socket ID in database
      user.isOnline = true;
      user.socketId = socket.id;
      await user.save();

      // 2. Broadcast online status to all other users
      socket.broadcast.emit('user-online', {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        isOnline: true,
      });

      // 3. Emit updated online users list to everyone
      const onlineUsers = await User.find({ isOnline: true }).select('_id name avatar isOnline');
      io.emit('online-users', onlineUsers);

      // 4. Handle global room joining
      socket.on('join-global', () => {
        socket.join('global-room');
        console.log(`User ${user.name} joined global-room`);
      });

      // Handle private room joining
      socket.on('join-private', (data) => {
        const { receiverId } = data;
        if (!receiverId) return;
        const roomId = [user._id.toString(), receiverId.toString()].sort().join('-');
        socket.join(roomId);
        console.log(`User ${user.name} joined private room: ${roomId}`);
      });

      // 5. Handle sending a global message
      socket.on('send-global-message', async (data) => {
        try {
          const { message } = data;
          if (!message || !message.trim()) return;

          const newMessage = await Message.create({
            sender: user._id,
            message: message.trim(),
            type: 'global',
            delivered: true,
            read: true,
          });

          const populatedMessage = await Message.findById(newMessage._id).populate(
            'sender',
            '_id name avatar'
          );

          // Broadcast to all sockets in global-room
          io.to('global-room').emit('global-message', populatedMessage);
        } catch (error) {
          console.error('Error sending global message via socket:', error.message);
        }
      });

      // 6. Handle sending a private message
      socket.on('send-private-message', async (data) => {
        try {
          const { receiverId, message } = data;
          if (!receiverId || !message || !message.trim()) return;

          // Find receiver to check if they are online
          const receiver = await User.findById(receiverId);
          const isReceiverOnline = receiver && receiver.isOnline;

          const newMessage = await Message.create({
            sender: user._id,
            receiver: receiverId,
            message: message.trim(),
            type: 'private',
            delivered: isReceiverOnline, // delivered true if online
          });

          const populatedMessage = await Message.findById(newMessage._id)
            .populate('sender', '_id name avatar')
            .populate('receiver', '_id name avatar');

          // Send to sender's socket
          socket.emit('private-message', populatedMessage);

          // Send to receiver if online
          if (isReceiverOnline && receiver.socketId) {
            io.to(receiver.socketId).emit('private-message', populatedMessage);
            // Trigger delivered status event
            socket.emit('delivered', { messageId: newMessage._id, receiverId });
          }
        } catch (error) {
          console.error('Error sending private message via socket:', error.message);
        }
      });

      // 7. Handle typing events
      socket.on('typing-start', async (data) => {
        const { receiverId, isGlobal } = data;
        
        if (isGlobal) {
          socket.broadcast.to('global-room').emit('typing', {
            senderId: user._id,
            isTyping: true,
            isGlobal: true,
          });
        } else if (receiverId) {
          const receiver = await User.findById(receiverId);
          if (receiver && receiver.isOnline && receiver.socketId) {
            io.to(receiver.socketId).emit('typing', {
              senderId: user._id,
              isTyping: true,
              isGlobal: false,
            });
          }
        }
      });

      socket.on('typing-stop', async (data) => {
        const { receiverId, isGlobal } = data;

        if (isGlobal) {
          socket.broadcast.to('global-room').emit('typing', {
            senderId: user._id,
            isTyping: false,
            isGlobal: true,
          });
        } else if (receiverId) {
          const receiver = await User.findById(receiverId);
          if (receiver && receiver.isOnline && receiver.socketId) {
            io.to(receiver.socketId).emit('typing', {
              senderId: user._id,
              isTyping: false,
              isGlobal: false,
            });
          }
        }
      });

      // 8. Handle read status marking
      socket.on('mark-as-read', async (data) => {
        const { senderId } = data; // the user who sent messages
        try {
          await Message.updateMany(
            { sender: senderId, receiver: user._id, read: false },
            { $set: { read: true } }
          );

          // Notify the sender that their messages to current user were read
          const sender = await User.findById(senderId);
          if (sender && sender.isOnline && sender.socketId) {
            io.to(sender.socketId).emit('read', { readerId: user._id });
          }
        } catch (error) {
          console.error('Error updating read status:', error.message);
        }
      });

      // 9. Handle disconnect event
      socket.on('disconnect', async () => {
        console.log(`User disconnected: ${user.name} (${socket.id})`);
        try {
          // Update online status in DB
          user.isOnline = false;
          user.socketId = '';
          user.lastSeen = new Date();
          await user.save();

          // Broadcast user-offline
          socket.broadcast.emit('user-offline', user._id);

          // Broadcast updated online list
          const activeUsers = await User.find({ isOnline: true }).select('_id name avatar isOnline');
          io.emit('online-users', activeUsers);
        } catch (error) {
          console.error('Error inside disconnect hook:', error.message);
        }
      });

    } catch (error) {
      console.error('Error inside socket connection initialization:', error.message);
    }
  });
};
