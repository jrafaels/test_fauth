import {Router} from 'express';
import {newToken} from '../controller/TokenController';

const router = Router();

// Sign up
router.route('/')
    .post(newToken);

export default router;