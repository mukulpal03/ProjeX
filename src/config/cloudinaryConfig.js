import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,  
  params: {
    folder: "stratify/userAvatar", 
    allowed_formats: ["png", "jpg", "jpeg", "webp"], 
    public_id: (req, file) => {
      return `${req.body.username}-${Date.now()}`; 
    },
  },
});

export { storage };
