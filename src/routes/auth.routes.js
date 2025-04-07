import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import {
  loginUser,
  registerUser,
  verifyUser,
} from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  userRegistrationValidator,
  userLoginValidator,
} from "../validators/index.js";
import isLoggedIn from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/register")
  .post(userRegistrationValidator(), validate, asyncHandler(registerUser));
router.route("/verify/:token").post(asyncHandler(verifyUser));
router
  .route("/login")
  .post(userLoginValidator(), validate, asyncHandler(loginUser));


router.get("/test", isLoggedIn, (req, res) => {
    res.send("hello")
})

export default router;
