import express from "express";
import Ingrediente from "../models/ingredientes.js";
import Produto from "../models/produtos.js"; // Para validação, se necessário

const router = express.Router();

// --------------------------------------------------------------------------------
// ROTA GET: Exibe o formulário de ingredientes
// O :produtoId captura o ID do produto recém-criado.
// --------------------------------------------------------------------------------
router.get("/ingredientes/adicionar/:produtoId", async (req, res) => {
    const produtoId = req.params.produtoId;
    
    // 1. Verificação de Segurança (Opcional, mas recomendado)
    if (!req.session.Usuario) {
        return res.redirect('/login');
    }           

    try {
        // 2. Busca todos os ingredientes disponíveis para o checkbox/select
        const ingredientesDisponiveis = await Ingrediente.findAll({
            attributes: ['id', 'nome'], 
            order: [['nome', 'ASC']]
        });
        
        // 3. Renderiza o formulário, passando o ID do produto e a lista de ingredientes
        res.render("adicionarIngredientes", { 
            produtoId: produtoId, // ID do produto a ser associado
            ingredientes: ingredientesDisponiveis 
        });
        
    } catch (error) {
        console.error("Erro ao carregar lista de ingredientes:", error);
        res.status(500).send("Erro ao carregar o formulário de ingredientes.");
    }
});


// --------------------------------------------------------------------------------
// ROTA POST: Processa a seleção de ingredientes e salva a associação N:M
// --------------------------------------------------------------------------------
router.post("/ingredientes/salvar", async (req, res) => {
    
    // O ID do produto vem de um campo hidden neste novo formulário
    const { produtoId, ingredientesSelecionados } = req.body;
    
    // Validação básica
    if (!produtoId) {
        return res.status(400).send("ID do Produto faltando. Retorne ao cadastro principal.");
    }

    try {
        // 1. Encontra o Produto (precisamos do objeto para usar o método addIngredientes)
        const produto = await Produto.findByPk(produtoId);
        
        if (!produto) {
             return res.status(404).send("Produto não encontrado.");
        }
        
        // 2. Associa os Ingredientes (se houver seleção)
        if (ingredientesSelecionados) {
             // Garante que ingredientesSelecionados é um array de IDs inteiros
            const idsParaAssociar = Array.isArray(ingredientesSelecionados) 
                ? ingredientesSelecionados.map(id => parseInt(id, 10))
                : [parseInt(ingredientesSelecionados, 10)];
            
            // O Sequelize magicamente associa na tabela pivot
            await produto.addIngredientes(idsParaAssociar);
        }
        
        // 3. Redirecionamento final após salvar tudo
        res.redirect("/produtos"); // Redireciona para a listagem principal

    } catch (error) {
        console.error("Erro ao salvar associação de ingredientes:", error);
        res.status(500).send(`
            <h1>Erro ao associar ingredientes:</h1>
            <p>${error.message}</p>
        `);
    }
});

export default router;