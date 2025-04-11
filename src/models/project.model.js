import mongoose, { Schema } from "mongoose";
import { ProjectMember } from "./projectmember.model.js";
import { ApiError } from "../utils/api-error.js";

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

projectSchema.post("findOneAndDelete", async (project, next) => {
  try {
    await ProjectMember.deleteMany({ project: project._id });
    next();
  } catch (error) {
    throw new ApiError(400, "Error while deleting members of project");
  }
});

export const Project = mongoose.model("Project", projectSchema);
