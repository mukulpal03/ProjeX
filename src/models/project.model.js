import mongoose, { Schema } from "mongoose";
import { ProjectMember } from "./projectmember.model.js";
import { ApiError } from "../utils/api-error.js";
import { ProjectNote } from "./note.model.js";
import { Task } from "./task.model.js";
import { SubTask } from "./subtask.model.js";

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

projectSchema.post("findOneAndDelete", async (project) => {
  if (project) {
    try {
      await ProjectMember.deleteMany({ project: project._id });
      await ProjectNote.deleteMany({ project: project._id });
      await Task.deleteMany({ project: project._id });
    } catch (error) {
      throw new ApiError(400, "Some Error occurred");
    }
  }
});

export const Project = mongoose.model("Project", projectSchema);
