import express from 'express';
import { getUsers, getOnlineUsers } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getUsers);
router.get('/online', protect, getOnlineUsers);

export default router;
