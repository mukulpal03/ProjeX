import { UserRolesEnum } from "../utils/constants.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { ProjectMember } from "../models/projectmember.model.js";
import { Project } from "../models/project.model.js";

const addMemberToProject = async (req, res, next) => {
  const { projectId } = req.params;
  const { email, role = UserRolesEnum.MEMBER } = req.body;

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

  res
    .status(201)
    .json(new ApiResponse(201, "Project created successfully", project));
};

const deleteMember = async (req, res, next) => {
  const { memberId, projectId } = req.params;

  if (!memberId) {
    return next(new ApiError(400, "Invalid member id"));
  }

  const member = await ProjectMember.findById(memberId);

  if (!member) {
    return next(new ApiError(404, "User is not a member of this project"));
  }

  if(member.role === UserRolesEnum.ADMIN) {
    return next(new ApiError(400, "Admins cannot remove themselves"))
  }

  await ProjectMember.findByIdAndDelete(memberId);

  res.status(200).json(new ApiResponse(200, "Member deleted successfully"));
};

const deleteProject = async (req, res, next) => {
  const { projectId } = req.params;

  if (!projectId) {
    return next(new ApiError(404, "Invalid project id"));
  }

  await Project.findByIdAndDelete(projectId);

  res.status(200).json(new ApiResponse(200, "Project deleted successfully"));
};

const getProjectById = async (req, res, next) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    return next(new ApiError(404, "No project found"));
  }

  res.status(200).json(new ApiResponse(200, project));
};

const getProjects = async (req, res) => {
  const memberProjects = await ProjectMember.find({
    user: req.user._id,
  }).select("project");

  const projectIds = memberProjects.map((project) => project.project);

  const projects = await Project.find({ _id: { $in: projectIds } });

  return res
    .status(200)
    .json(new ApiResponse(200, projects, "All your projects"));
};

const getProjectMembers = async (req, res) => {
  const { projectId } = req.params;

  const projectMembers = await ProjectMember.find({ project: projectId })
    .select("user role")
    .populate("user", "fullname");

  res.status(200).json(new ApiResponse(200, projectMembers, "All members"));
};

const updateProject = async (req, res, next) => {
  const { name, description } = req.body;
  const { projectId } = req.params;

  const project = await Project.findByIdAndUpdate(projectId, {
    $set: {
      name,
      description,
    },
  }, {
    $new: true
  });

  if (!project) {
    return next(new ApiError(400, "Error while updating project"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, project, "Project updated successfully"));
};

const updateMemberRole = async (req, res, next) => {
  const { role } = req.body;
  const { memberId, projectId } = req.params;

  const member = await ProjectMember.findByIdAndUpdate(
    memberId,
    {
      $set: {
        role,
      },
    },
    {
      new: true,
    },
  );

  if (!member) {
    return next(new ApiError(400, "Error while updating role"));
  }

  res
    .status(201)
    .json(new ApiResponse(201, member, "Role updated successfully"));
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
