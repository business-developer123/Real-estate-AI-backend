import { analyzeProperty, getStreetView, analyzeFile } from '../controllers/simpAI.controller';
import { Router } from 'express';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.post('/analyze-property', analyzeProperty);
router.post('/streetview', getStreetView);
router.post('/analyze-file', upload.single('file'), analyzeFile);

export default router;