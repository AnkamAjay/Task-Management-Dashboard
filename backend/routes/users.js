import express from 'express';
import User from '../models/User.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all users (for admin dropdown)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    // Return only id, name, email — never send passwords
    const users = await User.find().select('name email role').sort({ name: 1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

export default router;
