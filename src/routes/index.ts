import { Router } from 'express';
import authRoutes from './auth.route';
import simpAIRoutes from './simpAI.route';

const router = Router();

// Auth Routes
router.use('/auth', authRoutes);
router.use('/simpai', simpAIRoutes);

export default router;