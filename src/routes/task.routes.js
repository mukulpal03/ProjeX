import { Router } from "express";
import isLoggedIn from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import {
  createSubTask,
  createTask,
  deleteSubTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateSubTask,
  updateTask,
} from "../controllers/task.controllers";
import { subTaskValidator, taskValidator } from "../validators/task.validator";
import { validate } from "../middlewares/validator.middleware";

const router = Router();

router
  .route("/")
  .get(isLoggedIn, asyncHandler(getTasks))
  .post(isLoggedIn, taskValidator(), validate, asyncHandler(createTask));

router
  .route("/:taskId")
  .get(isLoggedIn, asyncHandler(getTaskById))
  .put(isLoggedIn, taskValidator(), validate, asyncHandler(updateTask))
  .delete(isLoggedIn, asyncHandler(deleteTask));

router
  .route("/:taskId/subtasks")
  .post(isLoggedIn, subTaskValidator(), validate, asyncHandler(createSubTask));

router
  .route("/:taskId/subtasks/:subTaskId")
  .put(isLoggedIn, subTaskValidator(), validate, asyncHandler(updateSubTask))
  .delete(isLoggedIn, asyncHandler(deleteSubTask));

export default router;
