import { Router } from 'express';
import { analyzeProperty } from '../controllers/simpAI.controller';

const router = Router();

// this route is used to search for a query
router.post('/analyze-property', analyzeProperty);

export default router;