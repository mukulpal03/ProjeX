import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import {
  addMemberValidator,
  ProjectValidator,
} from "../validators/project.validator.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  addMemberToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateMemberRole,
  updateProject,
} from "../controllers/project.controllers.js";
import isLoggedIn from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/:projectId/members")
  .post(
    isLoggedIn,
    addMemberValidator(),
    validate,
    asyncHandler(addMemberToProject),
  )
  .get(isLoggedIn, asyncHandler(getProjectMembers));
router
  .route("/:projectId/members/:memberId")
  .delete(isLoggedIn, asyncHandler(deleteMember))
  .put(isLoggedIn, asyncHandler(updateMemberRole));
router
  .route("/")
  .post(isLoggedIn, ProjectValidator(), validate, asyncHandler(createProject))
  .get(isLoggedIn, asyncHandler(getProjects));
router
  .route("/:projectId")
  .delete(isLoggedIn, asyncHandler(deleteProject))
  .get(isLoggedIn, asyncHandler(getProjectById))
  .put(isLoggedIn, ProjectValidator(), validate, asyncHandler(updateProject));
export default router;
