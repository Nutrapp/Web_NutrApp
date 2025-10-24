// controllers/ProdutosController.js
import express from "express";
import Produto from "../models/produto.js"; // Seu modelo de Produto
const router = express.Router();

// ROTA /produtos
router.get("/produtos", async function (req, res) {
    try {
        // 1. Ação do Model: Buscar todos os produtos no banco de dados.
        // O Sequelize retorna uma Promise, por isso usamos await.
        const produtos = await Produto.findAll({
            // Garante que os dados vêm como objetos JavaScript puros
            raw: true 
        });

        // 2. Passar os dados para a View:
        // O array 'produtos' (plural) será passado para o EJS.
        res.render("produtos", {
            produtos: produtos // Variável que o EJS vai acessar
        });

    } catch (error) {
        // Lidar com erros (ex: falha na conexão com o DB)
        console.error("Erro ao buscar produtos:", error);
        // Renderiza uma página de erro ou exibe uma mensagem
        res.status(500).render("erro", { 
            mensagem: "Não foi possível carregar os produtos. Tente novamente." 
        });
    }
});

export default router;