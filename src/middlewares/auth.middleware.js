import { ApiError } from "../utils/api-error.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const isLoggedIn = async (req, res, next) => {
  const { accessToken, refreshToken } = req.cookies;

  if (!accessToken) {
    if (!refreshToken) {
      return next(new ApiError(401, "Unauthorized Access"));
    }

    const refreshDecoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    try {
      const user = await User.findById(refreshDecoded.id);

      if (!user) {
        return next(new ApiError(401, "Unauthorized Access"));
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
    } catch (err) {}
  }
};

export default isLoggedIn;
