const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const { getComentariosYResenasByProductor } = require("../controllers/comentarioResenaController");

router.use(authenticateToken);


router.get("/productor", getComentariosYResenasByProductor);

module.exports = router;