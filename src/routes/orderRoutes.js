import express from "express";

const router = express.Router();

// Get all orders
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Order route working",
  });
});

// Create new order
router.post("/create", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Order created successfully",
  });
});

export default router;
