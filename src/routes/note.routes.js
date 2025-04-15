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

router
  .route("/")
  .get(isLoggedIn, isMember, asyncHandler(getNotes))
  .post(
    isLoggedIn,
    isMember,
    isAdmin,
    noteValidator(),
    validate,
    asyncHandler(createNote),
  );

router
  .route("/:noteId")
  .get(isLoggedIn, isMember, asyncHandler(getNoteById))
  .put(
    isLoggedIn,
    isMember,
    isAdmin,
    noteValidator(),
    validate,
    asyncHandler(updateNote),
  )
  .delete(isLoggedIn, isMember, isAdmin, asyncHandler(deleteNote));

export default router;
