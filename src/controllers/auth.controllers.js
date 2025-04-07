import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { sendMail, emailVerificationMailGenContent } from "../utils/mail.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const registerUser = async (req, res, next) => {
  const { username, email, password, fullname } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return next(new ApiError(409, "User already exists"));
  }

  const user = await User.create({
    username,
    email,
    password,
    fullname,
  });

  if (!user) {
    return next(new ApiError(500, "User not registered"));
  }

  const { hashedToken, unHashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save();

  await sendMail({
    email: user.email,
    subject: "Email Verification",
    mailGenContent: emailVerificationMailGenContent(
      user.username,
      `${process.env.BASE_URL}/api/v1/users/verify/${unHashedToken}`,
    ),
  });

  res.status(201).json(new ApiResponse(201, "User registered successfully"));
};

const verifyUser = async (req, res, next) => {
  const { token } = req.params;

  if (!token) {
    return next(new ApiError(401, "Invalid Token"));
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    return next(new ApiError(401, "Invalid Token"));
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;

  await user.save();

  res.status(200).json(new ApiResponse(200, "User verified successfully"));
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ApiError(401, "Incorrect email or password"));
  }

  if (!user.isEmailVerified) {
    return next(new ApiError(401, "Please verify your email"));
  }

  const passwordMatch = await user.isPasswordCorrect(password);

  if (!passwordMatch) {
    return next(new ApiError(401, "Incorrect email or password"));
  }

  const accessToken = jwt.sign(
    {
      id: user._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
  );

  const refreshToken = jwt.sign(
    {
      id: user._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
  );

  user.refreshToken = refreshToken;

  await user.save();

  res.cookie("accessToken", accessToken);
  res.cookie("refreshToken", refreshToken);

  res.status(200).json(new ApiResponse(200, "User logged in successfully"));
};

const logoutUser = async (req, res) => {};

const resendEmailVerification = async (req, res) => {};

const forgotPasswordReq = async (req, res) => {};

const resetPassword = async (req, res) => {};

const userProfile = async (req, res) => {};

export { registerUser, verifyUser, loginUser };
