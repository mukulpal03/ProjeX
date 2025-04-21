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

router.use(isLoggedIn);

router
  .route("/")
  .post(ProjectValidator(), validate, asyncHandler(createProject))
  .get(asyncHandler(getProjects));

router.use("/:projectId", isMember);

router
  .route("/:projectId/members")
  .post(
    isAdmin,
    addMemberValidator(),
    validate,
    asyncHandler(addMemberToProject),
  )
  .get(asyncHandler(getProjectMembers));

router
  .route("/:projectId/members/:memberId")
  .delete(isAdmin, asyncHandler(deleteMember))
  .put(isAdmin, asyncHandler(updateMemberRole));

router
  .route("/:projectId")
  .delete(isAdmin, asyncHandler(deleteProject))
  .get(asyncHandler(getProjectById))
  .put(isAdmin, ProjectValidator(), validate, asyncHandler(updateProject));

export default router;
