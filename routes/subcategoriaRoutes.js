const express = require("express");
const router = express.Router();
const { getAllSubcategorias } = require("../controllers/subcategoriaController");

router.get("/", getAllSubcategorias); 

module.exports = router;