import { Router } from 'express';
import { getStudyLogs, createStudyLog, deleteStudyLog, getStudyStats } from '../controllers/studyLogController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/stats', getStudyStats);
router.get('/', getStudyLogs);
router.post('/', createStudyLog);
router.delete('/:id', deleteStudyLog);

export default router;
