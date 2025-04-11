import { ProjectMember } from "../models/projectmember.model.js";
import { SubTask } from "../models/subtask.model.js";
import { Task } from "../models/task.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { TaskStatusEnum, UserRolesEnum } from "../utils/constants.js";

async function checkIfAllowedToModifyOrCreateTask(userId, projectId) {
  try {
    const user = await ProjectMember.findOne({
      project: projectId,
      user: userId,
      role: UserRolesEnum.ADMIN || UserRolesEnum.PROJECT_ADMIN,
    });

    if (!user) {
      return false;
    }

    return true;
  } catch (error) {
    throw new ApiError(400, error);
  }
}

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

const createTask = async (req, res, next) => {
  const { projectId } = req.params;
  const {
    title,
    description,
    assignedTo,
    status = TaskStatusEnum.TODO,
  } = req.body;

  const isAllowed = await checkIfAllowedToModifyOrCreateTask(
    req.user._id,
    projectId,
  );

  if (!isAllowed) {
    return next(new ApiError(401, "You are not allowed to create a task"));
  }

  const task = await Task.create({
    title,
    description,
    assignedTo,
    assignedBy: req.user._id,
    status,
  });

  if (!task) {
    return next(new ApiError(400, "Error while creating a task"));
  }

  res.status(201).json(new ApiResponse(201, task, "Task created successfully"));
};

const getTasks = async (req, res, next) => {
  const { projectId } = req.params;

  const isMember = await checkIfMember(req.user._id, projectId);

  if (!isMember) {
    return next(new ApiError(401, "You are not a part of this project"));
  }

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

  const isMember = await checkIfMember(req.user._id, projectId);

  if (!isMember) {
    return next(new ApiError(401, "You are not a part of this project"));
  }

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

  const isAllowed = await checkIfAllowedToModifyOrCreateTask(
    req.user._id,
    projectId,
  );

  if (!isAllowed) {
    return next(new ApiError(401, "You are not allowed to update a task"));
  }

  const task = await Task.findByIdAndUpdate(
    taskId,
    {
      $set: {
        title,
        description,
        assignedTo,
        status,
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

  const isAllowed = await checkIfAllowedToModifyOrCreateTask(
    req.user._id,
    projectId,
  );

  if (!isAllowed) {
    return next(new ApiError(401, "You are not allowed to delete a task"));
  }

  const task = await Task.findByIdAndDelete(taskId);

  if (!task) {
    return next(new ApiError(400, "Error while deleting the task"));
  }

  res.status(200).json(new ApiResponse(200, "Task deleted successfully"));
};

const createSubTask = async (req, res, next) => {
  const { projectId, taskId } = req.params;
  const { title } = req.body;

  const isAllowed = await checkIfAllowedToModifyOrCreateTask(
    req.user._id,
    projectId,
  );

  if (!isAllowed) {
    return next(new ApiError(401, "You are not allowed to create a task"));
  }

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

  const isAllowed = await checkIfAllowedToModifyOrCreateTask(
    req.user._id,
    projectId,
  );

  if (!isAllowed) {
    return next(new ApiError(401, "You are not allowed to update a task"));
  }

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

  const isAllowed = await checkIfAllowedToModifyOrCreateTask(
    req.user._id,
    projectId,
  );

  if (!isAllowed) {
    return next(new ApiError(401, "You are not allowed to delete a task"));
  }

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
