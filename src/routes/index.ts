import { Router } from 'express';
import authRoutes from './auth.route';

const router = Router();

// Auth Routes
router.use('/auth', authRoutes);

export default router;