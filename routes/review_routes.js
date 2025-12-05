const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review_controller");

router.post("/", reviewController.createReview);
router.get("/product/:id_producto", reviewController.getReviewsByProduct);
router.get("/", reviewController.getAllReviews);

module.exports = router;