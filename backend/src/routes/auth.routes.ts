import { Router } from 'express';
import { AuthController, loginValidation, registerValidation } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', loginValidation, AuthController.login);
router.post('/register', registerValidation, AuthController.register);
router.get('/me', authenticate, AuthController.me);

export default router;

