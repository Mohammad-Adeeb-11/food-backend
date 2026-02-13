import express from "express";

const router = express.Router();

// Get cart
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Cart route is working",
  });
});

// Add to cart
router.post("/add", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Item added to cart",
  });
});

export default router;
