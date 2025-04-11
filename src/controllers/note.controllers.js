import { ProjectNote } from "../models/note.model.js";
import { ProjectMember } from "../models/projectmember.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

async function checkIfMember(userId, projectId) {
  try {
    const member = await ProjectMember.findOne({
      user: userId,
      project: projectId,
    });

    if (!member) {
      return false;
    }

    return true;
  } catch (error) {
    throw new ApiError(401, error);
  }
}

async function checkIfAdmin(userId, projectId) {
  try {
    const admin = await ProjectMember.findOne({
      user: userId,
      project: projectId,
      role: UserRolesEnum.ADMIN,
    });

    if (!admin) {
      return false;
    }

    return true;
  } catch (error) {
    throw new ApiError(401, error);
  }
}

const createNote = async (req, res, next) => {
  const { projectId } = req.params;
  const { content } = req.body;

  const isAdmin = await checkIfAdmin(req.user._id, projectId);

  if (!isAdmin) {
    return next(
      new ApiError(401, "Permission denied, only admin can create a note"),
    );
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

  const isMember = await checkIfMember(req.user._id, projectId);

  if (!isMember) {
    return next(new ApiError(401, "You are not a part of this project"));
  }

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

  const isMember = await checkIfMember(req.user._id, projectId);

  if (!isMember) {
    return next(new ApiError(401, "You are not a part of this project"));
  }

  const note = await ProjectNote.findById(noteId).select("content");

  if (!note) {
    return next(new ApiError(404, "No note found"));
  }

  res.status(200).json(new ApiResponse(200, note, "Here is your note"));
};

const updateNote = async (req, res, next) => {
  const { projectId, noteId } = req.params;
  const { content } = req.params;

  const isAdmin = await checkIfAdmin(req.user._id, projectId);

  if (!isAdmin) {
    return next(
      new ApiError(401, "Permission denied, only admin can create a note"),
    );
  }

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

  const isAdmin = await checkIfAdmin(req.user._id, projectId);

  if (!isAdmin) {
    return next(
      new ApiError(401, "Permission denied, only admin can create a note"),
    );
  }

  const note = await ProjectNote.findByIdAndDelete(noteId);

  if (!note) {
    return next(new ApiError(400, "Error while deleting a note"));
  }

  res.status(200).json(new ApiResponse(200, "Note deleted successfully"));
};

export { createNote, deleteNote, getNoteById, getNotes, updateNote };
