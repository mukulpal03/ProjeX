import { Router } from "express";
import isLoggedIn from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createSubTask,
  createTask,
  deleteSubTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateSubTask,
  updateTask,
} from "../controllers/task.controllers.js";
import {
  subTaskValidator,
  taskValidator,
} from "../validators/task.validator.js";
import { validate } from "../middlewares/validator.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  isMember,
  taskPermission,
} from "../middlewares/permission.middleware.js";

const router = Router({ mergeParams: true });

router
  .route("/")
  .get(isLoggedIn, isMember, asyncHandler(getTasks))
  .post(
    isLoggedIn,
    isMember,
    taskPermission,
    upload.array("attachments", 5),
    taskValidator(),
    validate,
    asyncHandler(createTask),
  );

router
  .route("/:taskId")
  .get(isLoggedIn, isMember, asyncHandler(getTaskById))
  .put(
    isLoggedIn,
    isMember,
    taskPermission,
    upload.array("attachments", 5),
    taskValidator(),
    validate,
    asyncHandler(updateTask),
  )
  .delete(isLoggedIn, isMember, taskPermission, asyncHandler(deleteTask));

router
  .route("/:taskId/subtasks")
  .post(
    isLoggedIn,
    isMember,
    taskPermission,
    subTaskValidator(),
    validate,
    asyncHandler(createSubTask),
  );

router
  .route("/:taskId/subtasks/:subTaskId")
  .put(
    isLoggedIn,
    isMember,
    taskPermission,
    subTaskValidator(),
    validate,
    asyncHandler(updateSubTask),
  )
  .delete(isLoggedIn, isMember, taskPermission, asyncHandler(deleteSubTask));

export default router;
