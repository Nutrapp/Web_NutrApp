import express from "express";
const router = express.Router();

// ROTA Cadastro
router.get("/cadastro", function (req, res) {
    res.render("cadastro");
});

export default router;