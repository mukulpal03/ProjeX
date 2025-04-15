import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import {
  sendMail,
  emailVerificationMailGenContent,
  forgotPasswordMailGenContent,
} from "../utils/mail.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

async function generateAccessAndRefreshToken(userId) {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      401,
      "Error While generating access Token or Refresh Token",
    );
  }
}

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
    avatar: {
      url: req.file?.path,
      filename: req.file?.filename,
    },
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

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ApiError(401, "Incorrect email or password"));
  }

  const passwordMatch = await user.isPasswordCorrect(password);

  if (!passwordMatch) {
    return next(new ApiError(401, "Incorrect email or password"));
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, "User logged in successfully", {
        accessToken,
        refreshToken,
      }),
    );
};

const logoutUser = async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { $set: { refreshToken: null } });

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, "User logged out successfully"));
};

const refreshAccessToken = async (req, res, next) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;

  if (!token) {
    return next(new ApiError(401, "Invalid refresh Token"));
  }

  const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

  const user = await User.findById(decodedToken?._id).select("-password");

  if (!user) {
    return next(new ApiError(401, "Invalid refresh Token"));
  }

  if (token !== user?.refreshToken) {
    return next(new ApiError(401, "Invalid refresh Token"));
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  const { accessToken, newRefreshToken } =
    await generateAccessAndRefereshTokens(user._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken: newRefreshToken },
        "Access token refreshed",
      ),
    );
};

const resendEmailVerification = async (req, res, next) => {
  const user = req.user;

  if (!user) {
    return next(new ApiError(401, "Unauthorized access"));
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
};

const forgotPasswordReq = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email }).select("-password -refreshToken");

  if (!user) {
    return next(new ApiError(401, "User not found"));
  }

  const { hashedToken, unHashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpiry = tokenExpiry;

  await user.save();

  await sendMail({
    email: user.email,
    subject: "Reset Password",
    mailGenContent: forgotPasswordMailGenContent(
      user.username,
      `${process.env.BASE_URL}/api/v1/users/reset-password/${unHashedToken}`,
    ),
  });

  res.status(200).json(new ApiResponse(200, "Password reset email sent!"));
};

const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token) {
    return next(new ApiError(401, "Cannot reset password"));
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    return next(new ApiError(401, "Token expired"));
  }

  user.password = password;
  user.forgotPasswordToken = null;
  user.forgotPasswordExpiry = null;

  await user.save();

  res.status(201).json(new ApiResponse(201, "Password reset successfully"));
};

const userProfile = async (req, res) => {
  const user = req.user;

  res.status(200).json(
    new ApiResponse(200, `Welcome ${user.fullname}`, {
      user,
    }),
  );
};

const changeCurrentPassword = async (req, res, next) => {};

export {
  registerUser,
  verifyUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  userProfile,
  resendEmailVerification,
  forgotPasswordReq,
  resetPassword,
  changeCurrentPassword,
};
