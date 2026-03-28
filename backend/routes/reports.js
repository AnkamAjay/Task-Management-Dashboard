import express from 'express';
import { getSummaryReport, getDetailedReport } from '../controllers/reportController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/summary', getSummaryReport);
router.get('/detailed', getDetailedReport);

export default router;
