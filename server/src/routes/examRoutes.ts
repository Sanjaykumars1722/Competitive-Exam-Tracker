import { Router } from 'express';
import {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  updateTopicStatus,
  addSubject,
  addChapter,
  addTopic,
  getPresets,
  importPreset,
} from '../controllers/examController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/presets', getPresets);
router.post('/import-preset', importPreset);
router.get('/', getExams);
router.get('/:id', getExamById);
router.post('/', createExam);
router.put('/:id', updateExam);
router.delete('/:id', deleteExam);

// Syllabus updates
router.patch('/:examId/topics/:topicId', updateTopicStatus);
router.post('/:examId/subjects', addSubject);
router.post('/:examId/subjects/:subjectId/chapters', addChapter);
router.post('/:examId/chapters/:chapterId/topics', addTopic);

export default router;
