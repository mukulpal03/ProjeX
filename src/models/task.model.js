import mongoose, { Schema } from "mongoose";
import { SubTask } from "./subtask.model.js";
import { AvailableTaskStatus, TaskStatusEnum } from "../utils/constants.js";

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: AvailableTaskStatus,
      default: TaskStatusEnum.TODO,
    },
    attachments: {
      type: [
        {
          url: String,
          mimetype: String,
          size: Number,
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

taskSchema.post("findOneAndDelete", async (task, next) => {
  if (task) {
    try {
      await SubTask.deleteMany({ task: task._id });
      next();
    } catch (error) {
      throw new ApiError(400, "Error while deleting subtasks of project");
    }
  }
});

export const Task = mongoose.model("Task", taskSchema);
