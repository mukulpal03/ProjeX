import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import {
  changeCurrentPassword,
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
  changePassValidator,
} from "../validators/user.validator.js";
import isLoggedIn from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authLimitter } from "../middlewares/limitter.middleware.js";

const router = Router();

router
  .route("/register")
  .post(
    authLimitter,
    upload.single("avatar"),
    userRegistrationValidator(),
    validate,
    asyncHandler(registerUser),
  );

router.route("/verify/:token").post(authLimitter, asyncHandler(verifyUser));

router
  .route("/login")
  .post(authLimitter, userLoginValidator(), validate, asyncHandler(loginUser));

router.route("/logout").post(isLoggedIn, asyncHandler(logoutUser));

router.route("/refresh-access-token").post(asyncHandler(refreshAccessToken));

router.route("/profile").get(isLoggedIn, asyncHandler(userProfile));

router
  .route("/resend-email-verification")
  .post(isLoggedIn, asyncHandler(resendEmailVerification));

router
  .route("/forgot-password")
  .get(authLimitter, forgotPassValidator(), validate, asyncHandler(forgotPasswordReq));

router
  .route("/reset-password/:token")
  .post(authLimitter, resetPassValidator(), validate, asyncHandler(resetPassword));

router
  .route("/change-password")
  .post(
    isLoggedIn,
    changePassValidator(),
    validate,
    asyncHandler(changeCurrentPassword),
  );

export default router;
