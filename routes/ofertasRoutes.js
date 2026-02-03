const express = require("express");
const router = express.Router();
const { verificarToken } = require("../utils/jwt");
const {
  getAllPromocionesByProductorId,
  createDescuento,
  updateDescuento,
  deleteDescuento,
} = require("../controllers/ofestas_controllesPro");

router.get("/productor/:idProductor", verificarToken, getAllPromocionesByProductorId);
router.post("/", verificarToken, createDescuento);
router.put("/:idDescuento", verificarToken, updateDescuento);
router.delete("/:idDescuento", verificarToken, deleteDescuento);

module.exports = router;
