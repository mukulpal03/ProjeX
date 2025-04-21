import { ProjectMember } from "../models/projectmember.model.js";
import { ApiError } from "../utils/api-error.js";
import { UserRolesEnum } from "../utils/constants.js";

const isAdmin = async (req, _res, next) => {
  try {
    const admin = await ProjectMember.findOne({
      user: req.user._id,
      project: req.params.projectId,
      role: UserRolesEnum.ADMIN,
    });

    if (!admin) {
      return next(new ApiError(401, "Permission denied"));
    }

    next();
  } catch (error) {
    return next(new ApiError(401, "Authorization failed"));
  }
};

const isMember = async (req, _res, next) => {
  try {
    const member = await ProjectMember.findOne({
      user: req.user._id,
      project: req.params.projectId,
    });

    if (!member) {
      return next(new ApiError(401, "Project not found"));
    }

    next();
  } catch (error) {
    return next(new ApiError(401, "Authorization failed"));
  }
};

const taskPermission = async (req, _res, next) => {
  try {
    const user = await ProjectMember.findOne({
      project: req.params.projectId,
      user: req.user._id,
      role: UserRolesEnum.ADMIN || UserRolesEnum.PROJECT_ADMIN,
    });

    if (!user) {
      return next(new ApiError(401, "Permission denied"));
    }

    next();
  } catch (error) {
    return next(new ApiError(401, "Authorization failed"));
  }
};

export { isAdmin, isMember, taskPermission };
