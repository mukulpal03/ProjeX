import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import {
  addMemberValidator,
  createProjectValidator,
} from "../validators/project.validator.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  addMemberToProject,
  createProject,
} from "../controllers/project.controllers.js";
import isLoggedIn from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/add-member")
  .post(
    isLoggedIn,
    addMemberValidator(),
    validate,
    asyncHandler(addMemberToProject),
  );
router
  .route("/")
  .post(
    isLoggedIn,
    createProjectValidator(),
    validate,
    asyncHandler(createProject),
  );
export default router;
