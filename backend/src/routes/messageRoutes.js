import express from 'express';
import {
  getGlobalMessages,
  postGlobalMessage,
  getPrivateMessages,
  postPrivateMessage,
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/global', protect, getGlobalMessages);
router.post('/global', protect, postGlobalMessage);
router.get('/private/:userId', protect, getPrivateMessages);
router.post('/private', protect, postPrivateMessage);

export default router;
