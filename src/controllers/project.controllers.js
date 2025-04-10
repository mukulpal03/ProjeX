import { UserRolesEnum } from "../utils/constants.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { ProjectMember } from "../models/projectmember.model.js";
import { Project } from "../models/project.model.js";

const addMemberToProject = async (req, res, next) => {
  const { email, role = UserRolesEnum.MEMBER, projectId } = req.body;

  const user = await User.findOne({ email }).select("-password -refreshToken");

  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  const memberAlreadyExists = await ProjectMember.findOne({
    user: user._id,
    project: projectId,
  });

  if (memberAlreadyExists) {
    return next(new ApiError(404, "Member already exists"));
  }

  const member = await ProjectMember.create({
    user: user._id,
    project: projectId,
    role,
  });

  if (!member) {
    return next(new ApiError(400, "Error while adding a member"));
  }

  res
    .status(201)
    .json(new ApiResponse(201, member, "Member added successfully"));
};

const createProject = async (req, res, next) => {
  const { name, description } = req.body;

  const project = await Project.create({
    name,
    description,
    createdBy: req.user._id,
  });

  if (!project) {
    return next(new ApiError(400, "Error while creating a project"));
  }

  const member = await ProjectMember.create({
    user: req.user._id,
    project: project._id,
    role: UserRolesEnum.ADMIN,
  });

  if (!member) {
    return next(new ApiError(400, "Error while adding you as an admin"));
  }

  res.status(201).json(new ApiResponse(201, "Project created successfully", project))
};

const getProjects = async (req, res) => {
  // get all projects
};

const getProjectById = async (req, res) => {
  // get id from params
  // find project based on id
};

const updateProject = async (req, res) => {
  // update project
};

const deleteProject = async (req, res) => {
  // delete project
};

const getProjectMembers = async (req, res) => {
  // get project members
};

const deleteMember = async (req, res) => {
  // delete member from project
};

const updateMemberRole = async (req, res) => {
  // update member role
};

export {
  addMemberToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateMemberRole,
  updateProject,
};
