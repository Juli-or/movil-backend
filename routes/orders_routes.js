const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/order_controller"); 

router.post("/", ordersController.createOrder);        
router.get("/", ordersController.getOrders);             
router.get("/:id", ordersController.getOrderById);       
router.put("/:id", ordersController.updateOrder);        

module.exports = router;