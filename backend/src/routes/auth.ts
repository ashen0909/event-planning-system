import { Router } from 'express';
import { login, logout, me, register } from '../controllers/auth';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', me);
router.post('/register', register);

export default router;
