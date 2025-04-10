import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import {
  forgotPasswordReq,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetPassword,
  userProfile,
  verifyUser,
} from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  userRegistrationValidator,
  userLoginValidator,
  forgotPassValidator,
  resetPassValidator,
} from "../validators/user.validator.js";
import isLoggedIn from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/register")
  .post(userRegistrationValidator(), validate, asyncHandler(registerUser));
router.route("/verify/:token").post(asyncHandler(verifyUser));
router
  .route("/login")
  .post(userLoginValidator(), validate, asyncHandler(loginUser));
router.route("/logout").post(isLoggedIn, asyncHandler(logoutUser));
router.route("/refresh-access-token").post(asyncHandler(refreshAccessToken));
router.route("/profile").get(isLoggedIn, asyncHandler(userProfile));
router
  .route("/resend-email-verification")
  .post(isLoggedIn, asyncHandler(resendEmailVerification));
router
  .route("/forgot-password")
  .get(forgotPassValidator(), validate, asyncHandler(forgotPasswordReq));
router
  .route("/reset-password/:token")
  .post(resetPassValidator(), validate, asyncHandler(resetPassword));

export default router;
