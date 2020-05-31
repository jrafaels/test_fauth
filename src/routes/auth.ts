import {Router} from 'express';
import {createUser} from '../controller/UserController';
import {login, logout, recoverPassword, resetPassword} from '../controller/AuthController';
import {sendUserEmailPasswordRecovery, sendUserEmailPasswordReset, sendUserWelcomeEmail} from '../services/RequestService';

const router = Router();

// Sign up
router.route('/signup')
    .post(createUser, sendUserWelcomeEmail);

// Login
router.route('/login')
    .post(login);

// Logout
router.route('/logout')
    .post(logout);

// Recover
router.route('/recover')
    .post(recoverPassword, sendUserEmailPasswordRecovery);

// Reset
router.route('/reset')
    .post(resetPassword, sendUserEmailPasswordReset);

export default router;