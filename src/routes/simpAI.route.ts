import { analyzeProperty, getStreetView, analyzeFile, getHistories, getHistory, getReport } from '../controllers/simpAI.controller';
import { Router } from 'express';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.post('/analyze-property', analyzeProperty);
router.post('/streetview', getStreetView);
router.post('/analyze-file', upload.single('file'), analyzeFile);
router.get('/gethistories', getHistories);
router.get('/gethistory', getHistory);
router.post('/get-report', getReport)

export default router;