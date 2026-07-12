import Message from '../models/Message.js';

// @desc    Get global messages history
// @route   GET /api/v1/messages/global
// @access  Private
export const getGlobalMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ type: 'global' })
      .populate('sender', '_id name avatar')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a global message via REST
// @route   POST /api/v1/messages/global
// @access  Private
export const postGlobalMessage = async (req, res, next) => {
  const { message } = req.body;

  if (!message) {
    res.status(400);
    return next(new Error('Message text is required'));
  }

  try {
    const newMessage = await Message.create({
      sender: req.user._id,
      message,
      type: 'global',
      delivered: true,
      read: true,
    });

    const populatedMessage = await Message.findById(newMessage._id).populate(
      'sender',
      '_id name avatar'
    );

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get private messages history between current user and active user
// @route   GET /api/v1/messages/private/:userId
// @access  Private
export const getPrivateMessages = async (req, res, next) => {
  const otherUserId = req.params.userId;
  const currentUserId = req.user._id;

  try {
    // Find all messages between currentUserId and otherUserId
    const messages = await Message.find({
      type: 'private',
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    })
      .populate('sender', '_id name avatar')
      .populate('receiver', '_id name avatar')
      .sort({ createdAt: 1 });

    // Mark other user's messages to current user as read
    await Message.updateMany(
      { sender: otherUserId, receiver: currentUserId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a private message via REST
// @route   POST /api/v1/messages/private
// @access  Private
export const postPrivateMessage = async (req, res, next) => {
  const { receiverId, message } = req.body;
  const currentUserId = req.user._id;

  if (!receiverId || !message) {
    res.status(400);
    return next(new Error('Receiver ID and message text are required'));
  }

  try {
    const newMessage = await Message.create({
      sender: currentUserId,
      receiver: receiverId,
      message,
      type: 'private',
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', '_id name avatar')
      .populate('receiver', '_id name avatar');

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};
