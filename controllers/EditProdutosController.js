// controllers/EditProdutosController.js
import express from "express";
import Produto from "../models/produtos.js";
import Ingredientes from "../models/ingredientes.js";
import upload from "../middleware/uploadMiddleware.js"; // assume você já tem
import fs from "fs";
import path from "path";

const router = express.Router();

// GET /produto/edit/:id
router.get("/produto/edit/:id", async (req, res) => {
  const produtoId = req.params.id;
  const usuarioLogado = req.session.Usuario || null;

  try {
    const produto = await Produto.findByPk(produtoId, {
      include: [
        {
          model: Ingredientes,
          as: "ingredientes",
          through: { attributes: [] },
        },
      ],
    });
    if (!produto) return res.status(404).send("Produto não encontrado.");

    const ingredientes = await Ingredientes.findAll({ order: [["nome", "ASC"]], raw: true });

    const selecionados = (produto.ingredientes || []).map((i) => i.id);

    res.render("editProdutos", {
      produto: produto.toJSON(),
      usuarioLogado,
      ingredientes,
      ingredientesSelecionados: selecionados,
    });
  } catch (error) {
    console.error("Erro ao carregar produto para edição:", error);
    res.status(500).send("Erro interno ao buscar o produto para edição.");
  }
});

// POST /produto/update/:id
router.post(
  "/produto/update/:id",
  (req, res, next) => {
    // usa o upload middleware semelhante ao add
    upload.single("imagemProduto")(req, res, (err) => {
      if (err) {
        console.error("Erro do Multer:", err.message);
        return res.status(400).send(`Erro no upload da imagem: ${err.message}`);
      }
      next();
    });
  },
  async (req, res) => {
    const produtoId = req.params.id;
    const {
      nome_gen,
      marca_produto,
      cod_barra,
      quantidade,
      url_imagem_existente,
    } = req.body;
    const ingredientesSelecionados = req.body.ingredientes; // name="ingredientes"

    try {
      const produto = await Produto.findByPk(produtoId);
      if (!produto) return res.status(404).send("Produto não encontrado.");

      let novaUrl = url_imagem_existente || produto.url_imagem_produto;

      if (req.file && req.file.filename) {
        novaUrl = `/uploads/${req.file.filename}`;
      }

      await produto.update({
        nome_gen,
        marca_produto,
        cod_barra,
        quantidade: quantidade ? parseInt(quantidade, 10) : null,
        url_imagem_produto: novaUrl,
      });

      // Atualiza associações: setIngredientes substitui as antigas
      if (!ingredientesSelecionados) {
        await produto.setIngredientes([]); // remove todos
      } else {
        const listaIds = Array.isArray(ingredientesSelecionados)
          ? ingredientesSelecionados.map((i) => Number(i))
          : [Number(ingredientesSelecionados)];
        await produto.setIngredientes(listaIds);
      }

      // Se trocou imagem, remove a antiga fisicamente
      if (req.file && produto.url_imagem_produto && url_imagem_existente) {
        const nomeArquivoAntigo = path.basename(url_imagem_existente);
        const caminhoFisicoAntigo = path.join(process.cwd(), "public", "uploads", nomeArquivoAntigo);
        if (fs.existsSync(caminhoFisicoAntigo)) {
          fs.unlink(caminhoFisicoAntigo, (err) => {
            if (err) console.error("Erro ao remover imagem antiga:", err);
          });
        }
      }

      res.redirect(`/produto/${produtoId}`);
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      // remove imagem nova se houver erro
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Falha ao excluir imagem após erro:", err);
        });
      }
      res.status(500).send("Erro interno ao atualizar produto.");
    }
  }
);

export default router;
