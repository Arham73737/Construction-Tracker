import { Router } from 'express';
import { getUserById } from '../controllers/auth.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.use(auth);
router.get('/:id', getUserById);

export default router;
