import { ProjectNote } from "../models/note.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

const createNote = async (req, res, next) => {
  const { projectId } = req.params;
  const { content } = req.body;

  const existingNote = await ProjectNote.findOne({ content });

  if (existingNote) {
    return next(new ApiError(400, "Note with this name already exists"));
  }

  const note = await ProjectNote.create({
    project: projectId,
    createdBy: req.user._id,
    content,
  });

  if (!note) {
    return next(new ApiError(401, "Error while creating a note"));
  }

  res.status(201).json(new ApiResponse(201, note, "Note created successfully"));
};

const getNotes = async (req, res, next) => {
  const { projectId } = req.params;

  const notes = await ProjectNote.find({
    project: projectId,
  }).select("content");

  if (!notes) {
    return next(new ApiError(404, "No notes found"));
  }

  res.status(200).json(new ApiResponse(200, notes, "All notes"));
};

const getNoteById = async (req, res, next) => {
  const { projectId, noteId } = req.params;

  const note = await ProjectNote.findById(noteId).select("content");

  if (!note) {
    return next(new ApiError(404, "No note found"));
  }

  res.status(200).json(new ApiResponse(200, note, "Here is your note"));
};

const updateNote = async (req, res, next) => {
  const { projectId, noteId } = req.params;
  const { content } = req.body;

  const note = await ProjectNote.findByIdAndUpdate(
    noteId,
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    },
  );

  if (!note) {
    return next(new ApiError(400, "Error while updating the note"));
  }

  res.status(200).json(new ApiResponse(200, note, "Note updated successfully"));
};

const deleteNote = async (req, res, next) => {
  const { projectId, noteId } = req.params;

  const note = await ProjectNote.findByIdAndDelete(noteId);

  if (!note) {
    return next(new ApiError(400, "Error while deleting a note"));
  }

  res.status(200).json(new ApiResponse(200, "Note deleted successfully"));
};

export { createNote, deleteNote, getNoteById, getNotes, updateNote };
