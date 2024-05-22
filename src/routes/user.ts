import { Router } from "express";
import { changePassword, deleteUser, forgotPassword, getUser, resetPassword, sendVerificationEmail, signin, signout, signup, updateUser, validateOtp, verifyEmail } from "../controller/user";
import { verifyToken } from "../middleware/verifyToken";

const router = Router();

router.route('/signup').post(signup);
router.route('/signin').post(signin);
router.route('/signout').post(verifyToken, signout);
router.route('/send-verification-email').post(verifyToken, sendVerificationEmail);
router.route('/verify-email').post(verifyEmail);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:token').put(resetPassword);
router
.route('/:id')
.get(verifyToken, getUser)
.put(verifyToken, updateUser)
.delete(verifyToken, deleteUser)

router.route('/validate-otp/:id').put(verifyToken, validateOtp);
router.route('/change-password/:id').put(verifyToken, changePassword);



export default router;