// controllers/AddProdutosController.js
import express from "express";
import Produto from "../models/produtos.js";
import Ingredientes from "../models/ingredientes.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) => {
    const codBarra = req.body.cod_barra || "produto-sem-barra";
    const ext = path.extname(file.originalname);
    cb(null, `${codBarra}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /addProdutos -> formulário
router.get("/addProdutos", async (req, res) => {
  if (!req.session.Usuario || !req.session.Usuario.id) return res.redirect("/login");

  try {
    const ingredientes = await Ingredientes.findAll({ order: [["nome", "ASC"]], raw: true });
    res.render("addProdutos", { usuarioLogado: req.session.Usuario, ingredientes });
  } catch (error) {
    console.error("Erro ao carregar ingredientes:", error);
    res.status(500).send("Erro ao carregar ingredientes para cadastro.");
  }
});

// POST /Produto -> cria produto e associa ingredientes via association methods
router.post("/Produto", upload.single("imagemProduto"), async (req, res) => {
  const userId = req.session.Usuario ? req.session.Usuario.id : null;
  if (!userId) return res.status(401).send("Acesso não autorizado. Faça login.");

  const { cod_barra, nome_gen, marca_produto, quantidade } = req.body;
  // formulário envia checkboxes com name="ingredientes" -> req.body.ingredientes
  const ingredientesSelecionados = req.body.ingredientes;

  const caminhoImagem = req.file ? `/uploads/${req.file.filename}` : null;
  const qtd = quantidade ? parseInt(quantidade, 10) : null;

  if (!cod_barra || !nome_gen || !marca_produto || !caminhoImagem) {
    console.error("Dados incompletos ou imagem faltando.");
    return res.status(400).send("Preencha todos os campos e envie uma imagem.");
  }

  try {
    const novoProduto = await Produto.create({
      cod_barra,
      nome_gen,
      marca_produto,
      quantidade: qtd,
      url_imagem_produto: caminhoImagem,
      usuario_id_fk: userId,
    });

    // associa ingredientes de forma correta (usa addIngredientes do Sequelize)
    if (ingredientesSelecionados) {
      const listaIds = Array.isArray(ingredientesSelecionados)
        ? ingredientesSelecionados.map((i) => Number(i))
        : [Number(ingredientesSelecionados)];
      await novoProduto.addIngredientes(listaIds);
      console.log(`Ingredientes associados ao produto ID ${novoProduto.id}:`, listaIds);
    }

    res.redirect("/produtos");
  } catch (error) {
    console.error("Erro ao salvar produto:", error);
    res.status(500).send(`
      <h1>Erro ao cadastrar produto:</h1>
      <p>${error.message}</p>
      <a href="/addProdutos">Voltar</a>
    `);
  }
});

export default router;
