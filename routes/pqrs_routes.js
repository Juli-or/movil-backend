const express = require("express");
const router = express.Router();
const pqrsController = require("../controllers/pqrs_controller");

router.post("/", pqrsController.createPqrs); 
router.get("/my-pqrs/:id_usuario", pqrsController.getMyPqrs); 
router.get("/:id_pqrs", pqrsController.getPqrsById);
router.get("/", pqrsController.getAllPqrs);
router.put("/:id_pqrs", pqrsController.updatePqrsStatus);
module.exports = router;