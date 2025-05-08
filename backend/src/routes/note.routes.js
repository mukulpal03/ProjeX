import { Router } from "express";
import isLoggedIn from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createNote,
  deleteNote,
  getNoteById,
  getNotes,
  updateNote,
} from "../controllers/note.controllers.js";
import { noteValidator } from "../validators/note.validator.js";
import { validate } from "../middlewares/validator.middleware.js";
import { isMember, isAdmin } from "../middlewares/permission.middleware.js";

const router = Router({ mergeParams: true });

router.use(isLoggedIn);

router.use("/:noteId", isMember);

router
  .route("/")
  .get(asyncHandler(getNotes))
  .post(isAdmin, noteValidator(), validate, asyncHandler(createNote));

router
  .route("/:noteId")
  .get(asyncHandler(getNoteById))
  .put(isAdmin, noteValidator(), validate, asyncHandler(updateNote))
  .delete(isAdmin, asyncHandler(deleteNote));

export default router;
