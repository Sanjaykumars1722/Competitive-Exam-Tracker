import { Router } from 'express';
import {
  getMockTests,
  createMockTest,
  getMockTestById,
  deleteMockTest,
  getMockAnalytics,
} from '../controllers/mockTestController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/analytics', getMockAnalytics);
router.get('/', getMockTests);
router.get('/:id', getMockTestById);
router.post('/', createMockTest);
router.delete('/:id', deleteMockTest);

export default router;
