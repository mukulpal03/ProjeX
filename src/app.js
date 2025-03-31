import express from "express";
import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRoutes from "./routes/auth.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/users", authRoutes);

export default app;
