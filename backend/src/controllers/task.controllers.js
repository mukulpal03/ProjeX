import { SubTask } from "../models/subtask.model.js";
import { Task } from "../models/task.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { TaskStatusEnum } from "../utils/constants.js";

const createTask = async (req, res, next) => {
  const { projectId } = req.params;
  const {
    title,
    description,
    assignedTo,
    status = TaskStatusEnum.TODO,
  } = req.body;

  const attachments = req.files?.map((file) => ({
    url: file.path,
    mimetype: file.mimetype,
    size: file.size,
  }));

  const task = await Task.create({
    title,
    description,
    project: projectId,
    assignedTo,
    assignedBy: req.user._id,
    status,
    attachments,
  });

  if (!task) {
    return next(new ApiError(400, "Error while creating a task"));
  }

  res.status(201).json(new ApiResponse(201, task, "Task created successfully"));
};

const getTasks = async (req, res, next) => {
  const { projectId } = req.params;

  const tasks = await Task.find({
    project: projectId,
  }).select("title");

  if (!tasks) {
    return next(new ApiError(404, "No tasks found"));
  }

  res.status(200).json(new ApiResponse(200, tasks, "All tasks"));
};

const getTaskById = async (req, res, next) => {
  const { projectId, taskId } = req.params;

  const task = await Task.findById(taskId).select("title");

  if (!task) {
    return next(new ApiError(404, "No task found"));
  }

  res.status(200).json(new ApiResponse(200, task, "Here is your task"));
};

const updateTask = async (req, res, next) => {
  const { projectId, taskId } = req.params;
  const {
    title,
    description,
    assignedTo,
    status = TaskStatusEnum.TODO,
  } = req.body;

  const attachments = req.files?.map((file) => ({
    url: file.path,
    mimetype: file.mimetype,
    size: file.size,
  }));

  const task = await Task.findByIdAndUpdate(
    taskId,
    {
      $set: {
        title,
        description,
        assignedTo,
        status,
        attachments
      },
    },
    {
      new: true,
    },
  );

  if (!task) {
    return next(new ApiError(400, "Error while updating the task"));
  }

  res.status(200).json(new ApiResponse(200, task, "Task updated successfully"));
};

const deleteTask = async (req, res, next) => {
  const { projectId, taskId } = req.params;

  const task = await Task.findByIdAndDelete(taskId);

  if (!task) {
    return next(new ApiError(400, "Error while deleting the task"));
  }

  res.status(200).json(new ApiResponse(200, "Task deleted successfully"));
};

const createSubTask = async (req, res, next) => {
  const { projectId, taskId } = req.params;
  const { title } = req.body;

  const subTask = await SubTask.create({
    title,
    task: taskId,
    createdBy: req.user._id,
  });

  if (!subTask) {
    return next(new ApiError(400, "Error while creating a task"));
  }

  res
    .status(201)
    .json(new ApiResponse(201, subTask, "Task created successfully"));
};

const updateSubTask = async (req, res, next) => {
  const { projectId, subTaskId } = req.params;
  const { title, isCompleted } = req.body;

  const subTask = await SubTask.findByIdAndUpdate(
    subTaskId,
    {
      $set: {
        title,
      },
    },
    {
      new: true,
    },
  );

  if (!subTask) {
    return next(new ApiError(400, "Error while updating a task"));
  }

  if (isCompleted) {
    subTask.isCompleted = true;
  }

  await subTask.save();

  res
    .status(200)
    .json(new ApiResponse(200, subTask, "Task updated successfully"));
};

const deleteSubTask = async (req, res, next) => {
  const { projectId, subTaskId } = req.params;

  const subTask = await SubTask.findByIdAndDelete(subTaskId);

  if (!subTask) {
    return next(new ApiError(400, "Error while deleting the task"));
  }

  res.status(200).json(new ApiResponse(200, "Task deleted successfully"));
};

export {
  createSubTask,
  createTask,
  deleteSubTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateSubTask,
  updateTask,
};
