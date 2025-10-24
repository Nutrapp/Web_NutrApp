import express from "express";
const router = express.Router();

router.get("/addProdutos", (req, res) => {
  res.render("addProdutos");
});
export default router;
