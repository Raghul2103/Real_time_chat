import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate JWT and set cookie
const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'chat_app_jwt_secret_dev_key_123456789',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // None for cross-site, Lax for dev
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    return next(new Error('Please enter all fields (name, email, password)'));
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      return next(new Error('User already exists with this email'));
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      generateTokenAndSetCookie(res, user._id);
      
      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isOnline: user.isOnline,
          lastSeen: user.lastSeen,
        },
      });
    } else {
      res.status(400);
      next(new Error('Invalid user data provided'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/v1/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    return next(new Error('Please enter email and password'));
  }

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      generateTokenAndSetCookie(res, user._id);

      res.status(200).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isOnline: user.isOnline,
          lastSeen: user.lastSeen,
        },
      });
    } else {
      res.status(401);
      next(new Error('Invalid email or password'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/v1/auth/logout
// @access  Public
export const logoutUser = async (req, res, next) => {
  try {
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0), // expire immediately
    });
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    // req.user is set by authMiddleware
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};
