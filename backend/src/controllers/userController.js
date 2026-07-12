import User from '../models/User.js';

// @desc    Get all users (for chat sidebar list, excluding current user)
// @route   GET /api/v1/users
// @access  Private
export const getUsers = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    // Find all users except the current authenticated user
    const users = await User.find({ _id: { $ne: currentUserId } })
      .select('-password')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get online users
// @route   GET /api/v1/users/online
// @access  Private
export const getOnlineUsers = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const onlineUsers = await User.find({ 
      isOnline: true, 
      _id: { $ne: currentUserId } 
    }).select('-password');

    res.status(200).json({
      success: true,
      users: onlineUsers,
    });
  } catch (error) {
    next(error);
  }
};
