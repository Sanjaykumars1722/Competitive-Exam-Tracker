import { Router } from 'express';
import {
  getMaterials,
  createMaterial,
  updateMaterial,
  toggleFavorite,
  deleteMaterial,
} from '../controllers/materialController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getMaterials);
router.post('/', createMaterial);
router.put('/:id', updateMaterial);
router.patch('/:id/favorite', toggleFavorite);
router.delete('/:id', deleteMaterial);

export default router;
