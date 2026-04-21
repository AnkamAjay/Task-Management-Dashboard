import Notification from '../models/Notification.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (req, res, next) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    if (String(notification.userId) !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    next(error);
  }
};

export const createInternalNotification = async (userId, message, type) => {
  try {
    await Notification.create({ userId, message, type });
  } catch (error) {
    console.error('Error creating internal notification:', error);
  }
};
