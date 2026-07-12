import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  // Retrieve token from HTTP-only cookie named 'jwt'
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no token provided'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'chat_app_jwt_secret_dev_key_123456789');

    // Get user from database, excluding password
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      res.status(401);
      return next(new Error('Not authorized, user not found'));
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    res.status(401);
    next(new Error('Not authorized, token validation failed'));
  }
};
