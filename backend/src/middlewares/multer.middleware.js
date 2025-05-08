import multer from "multer";
import { storage } from "../config/cloudinaryConfig.js";

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1 * 1000 * 1000,
  },
});
