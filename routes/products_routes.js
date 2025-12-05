const express = require("express");
const router = express.Router();
const productController = require("../controllers/product_controller");
router.get("/", productController.getAllProducts);
router.get("/:id_producto", productController.getProductById);

module.exports = router;