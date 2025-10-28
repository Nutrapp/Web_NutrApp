import express from "express";
import Ingrediente from "../models/ingredientes.js";
import Produto from "../models/produtos.js"; 

const router = express.Router();

router.get("/ingredientes/adicionar/:produtoId", async (req, res) => {
    const produtoId = req.params.produtoId;
    if (!req.session.Usuario) {
        return res.redirect('/login');
    }           

    try {
        const ingredientesDisponiveis = await Ingrediente.findAll({
            attributes: ['id', 'nome'], 
            order: [['nome', 'ASC']]
        });
        
        res.render("adicionarIngredientes", { 
            produtoId: produtoId, 
            ingredientes: ingredientesDisponiveis 
        });
        
    } catch (error) {
        console.error("Erro ao carregar lista de ingredientes:", error);
        res.status(500).send("Erro ao carregar o formulário de ingredientes.");
    }
});

router.post("/ingredientes/salvar", async (req, res) => {
    const { produtoId, ingredientesSelecionados } = req.body;

    if (!produtoId) {
        return res.status(400).send("ID do Produto faltando. Retorne ao cadastro principal.");
    }

    try {
        const produto = await Produto.findByPk(produtoId);
        
        if (!produto) {
             return res.status(404).send("Produto não encontrado.");
        }

        if (ingredientesSelecionados) {
            const idsParaAssociar = Array.isArray(ingredientesSelecionados) 
                ? ingredientesSelecionados.map(id => parseInt(id, 10))
                : [parseInt(ingredientesSelecionados, 10)];

            await produto.addIngredientes(idsParaAssociar);
        }

        res.redirect("/produtos");

    } catch (error) {
        console.error("Erro ao salvar associação de ingredientes:", error);
        res.status(500).send(`
            <h1>Erro ao associar ingredientes:</h1>
            <p>${error.message}</p>
        `);
    }
});

export default router;