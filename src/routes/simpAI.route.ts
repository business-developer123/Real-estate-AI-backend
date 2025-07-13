import { Router } from 'express';
import { analyzeProperty, getStreetView } from '../controllers/simpAI.controller';

const router = Router();

// this route is used to search for a query
router.post('/analyze-property', analyzeProperty);
router.post('/streetview', getStreetView);

export default router;