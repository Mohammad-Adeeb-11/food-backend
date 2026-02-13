import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import AppError from "../utils/AppError.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // 1️⃣ Get token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("You are not logged in", 401));
    }

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3️⃣ Find user
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(new AppError("User no longer exists", 401));
    }

    // 4️⃣ Check if verified
    if (!currentUser.isVerified) {
      return next(new AppError("Email not verified", 401));
    }

    // 5️⃣ Attach user to request
    req.user = currentUser;

    next();
  } catch (error) {
    next(error);
  }
};
