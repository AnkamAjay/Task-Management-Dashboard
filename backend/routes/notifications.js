import express from 'express';
import { getMyNotifications, createNotification, markAsRead } from '../controllers/notificationController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
router.use(verifyToken);
router.get('/', getMyNotifications);
router.post('/', createNotification);
router.patch('/:id/read', markAsRead);

export default router;
