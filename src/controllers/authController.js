import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import AppError from "../utils/AppError.js";
import sendEmail from "../utils/sendEmail.js";

// Generate JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// 1️⃣ Send OTP
export const sendOtp = async (req, res, next) => {
  const { email } = req.body;

  if (!email) return next(new AppError("Email is required", 400));

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  const otpExpires = Date.now() + 10 * 60 * 1000; // 10 min

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      email,
      otp: hashedOtp,
      otpExpires,
    });
  } else {
    user.otp = hashedOtp;
    user.otpExpires = otpExpires;
    await user.save();
  }

  await sendEmail({
    email,
    subject: "Your OTP Code",
    message: `Your OTP is ${otp}. It expires in 10 minutes.`,
  });

  res.status(200).json({
    status: "success",
    message: "OTP sent to email",
  });
};


export const verifyOtp = async (req, res, next) => {
  const { email, otp, name, password } = req.body;

  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  const user = await User.findOne({
    email,
    otp: hashedOtp,
    otpExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError("Invalid or expired OTP", 400));

  user.name = name;
  user.password = password;
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save();

  const token = signToken(user._id);

  res.status(201).json({
    status: "success",
    token,
    user,
  });
};


export const login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid credentials", 401));
  }

  if (!user.isVerified) {
    return next(new AppError("Please verify your email first", 401));
  }

  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
    user,
  });
};
