import express from "express";
const router = express.Router();

// ROTA Login
router.get("/login", function (req, res) {
    res.render("login");
});

export default router;