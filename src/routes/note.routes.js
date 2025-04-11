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

const router = Router();

router
  .route("/")
  .get(isLoggedIn, asyncHandler(getNotes))
  .post(isLoggedIn, noteValidator(), validate, asyncHandler(createNote));

router
  .route("/:noteId")
  .get(isLoggedIn, asyncHandler(getNoteById))
  .put(isLoggedIn, noteValidator(), validate, asyncHandler(updateNote))
  .delete(isLoggedIn, asyncHandler(deleteNote));

export default router;
