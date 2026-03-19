import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  let token;

  // Check if authorization header exists and has the Bearer format
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from string "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user by ID from the token payload, and attach to req.user (excluding password)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next(); // Move to the actual route handler
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // If no token was found in the header
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export const requireAdmin = (req, res, next) => {
  // Check if user is attached (via verifyToken) and has admin role
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Not authorized as an admin' });
  }
};
