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
import { isMember, isAdmin } from "../middlewares/permission.middleware.js";

const router = Router();

router
  .route("/:projectId/members")
  .post(
    isLoggedIn,
    isMember,
    isAdmin,
    addMemberValidator(),
    validate,
    asyncHandler(addMemberToProject),
  )
  .get(isLoggedIn, isMember, asyncHandler(getProjectMembers));

router
  .route("/:projectId/members/:memberId")
  .delete(isLoggedIn, isMember, isAdmin, asyncHandler(deleteMember))
  .put(isLoggedIn, isMember, isAdmin, asyncHandler(updateMemberRole));

router
  .route("/")
  .post(isLoggedIn, ProjectValidator(), validate, asyncHandler(createProject))
  .get(isLoggedIn, asyncHandler(getProjects));

router
  .route("/:projectId")
  .delete(isLoggedIn, isMember, isAdmin, asyncHandler(deleteProject))
  .get(isLoggedIn, isMember, asyncHandler(getProjectById))
  .put(
    isLoggedIn,
    isMember,
    isAdmin,
    ProjectValidator(),
    validate,
    asyncHandler(updateProject),
  );
export default router;
