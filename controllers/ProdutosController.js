import express from "express";
import Produto from "../models/produtos.js";
import Usuario from "../models/usuario.js";
import { Op } from "sequelize";
const router = express.Router();

router.get("/produtos/pesquisar", (req, res) => {
    res.redirect(`/produtos?q=${encodeURIComponent(req.query.q || '')}`);
});

// =========================================================================
// ROTA GET /produtos (Lista produtos e lida com a busca)
// =========================================================================
router.get("/produtos", async function (req, res) {
    const termoPesquisa = req.query.q;
    const whereClause = {};

    if (termoPesquisa) {
        whereClause.nome_gen = {
            [Op.like]: `%${termoPesquisa}%`
        };
    }

    try {
        // 1. Busca os produtos (mantendo raw: true)
        const produtos = await Produto.findAll({
            where: whereClause,
            raw: true // MANTÉM RAW: TRUE
        });

        // --- MUDANÇA CRÍTICA: BUSCA MANUAL DOS NOMES ---
        // 2. Extrai IDs únicos de usuários
        const userIds = [...new Set(produtos.map(p => p.usuario_id_fk).filter(id => id))];

        // 3. Busca todos os usuários de uma vez
        const usuarios = await Usuario.findAll({
            where: { id: userIds },
            attributes: ['id', 'nome'],
            raw: true
        });

        // 4. Cria um mapa de ID para Nome para fácil acesso
        const userMap = {};
        usuarios.forEach(user => {
            userMap[user.id] = user.nome;
        });

        // 5. Adiciona o nome do usuário a cada objeto produto
        const produtosComNome = produtos.map(produto => ({
            ...produto, // Clona todas as propriedades do produto
            nomeCadastrador: produto.usuario_id_fk ? userMap[produto.usuario_id_fk] || 'Não Encontrado' : 'Não Registrado'
        }));
        // ---------------------------------------------

        const usuarioLogado = req.session.Usuario || null;

        // 6. Renderiza a view 'produtos'
        res.render("produtos", {
            produtos: produtosComNome, // Passando os produtos com o novo campo
            usuarioLogado: usuarioLogado,
            termoPesquisa: termoPesquisa || '' 
        });

    } catch (error) {
        // O erro "erro" está sendo capturado aqui, por isso você precisa do arquivo erro.ejs
        console.error(`Erro ao buscar produtos (Termo: ${termoPesquisa || 'Nenhum'}):`, error);
        res.status(500).render("erro", {
            mensagem: "Não foi possível carregar os produtos. Tente novamente."
        });
    }
});

// =========================================================================
// ROTA GET /produto/:id: Exibe os detalhes de um produto
// =========================================================================
router.get("/produto/:id", async (req, res) => {
    const produtoId = req.params.id;
    const usuarioLogado = req.session.Usuario || null; 
    let nomeCadastrador = 'Usuário Não Encontrado'; // Variável para a view

    try {
        // 1. Busca o produto (mantendo raw: true)
        const produto = await Produto.findByPk(produtoId, {
            raw: true
        });

        if (!produto) {
            // Verifica se o erro "erro" já foi resolvido, se não, use res.redirect
            return res.redirect("/produtos"); 
        }

        // 2. Busca o nome do usuário (com raw: true para simplicidade)
        if (produto.usuario_id_fk) {
            const cadastrador = await Usuario.findByPk(produto.usuario_id_fk, {
                raw: true // ESSENCIAL para evitar problemas de instância
            });
            
            if (cadastrador && cadastrador.nome) {
                nomeCadastrador = cadastrador.nome; 
            }
        }
        
        // 3. Renderiza a view, passando o nome do cadastrador
        res.render("viewsProdutos", {
            produto: produto, 
            usuarioLogado: usuarioLogado,
            nomeCadastrador: nomeCadastrador // A variável que viewsProdutos.ejs precisa
        });

    } catch (error) {
        console.error(`Erro ao buscar detalhes do produto ID ${produtoId}:`, error);
        // Use a view de erro se ela existir, ou redirecione.
        res.redirect("/produtos"); 
    }
});

// =========================================================================
// ROTA POST /produtos/delete/:id (INALTERADA)
// =========================================================================
router.post("/produtos/delete/:id", async (req, res) => {
    const produtoId = req.params.id;
    const userId = req.session.Usuario ? req.session.Usuario.id : null;

    if (!userId) {
        console.warn(`Tentativa de exclusão não autorizada. Produto ID: ${produtoId}`);
        return res.status(401).send("Acesso negado. Você deve estar logado para excluir produtos.");
    }

    try {
        const produto = await Produto.findByPk(produtoId);

        if (!produto) {
            console.warn(`Tentativa de exclusão de produto inexistente (ID: ${produtoId}).`);
            return res.redirect("/produtos");
        }

        if (String(produto.usuario_id_fk) !== String(userId)) {
            console.warn(`Usuário ${userId} tentou excluir produto de outro usuário (${produto.usuario_id_fk}).`);
            return res.status(403).send("Ação proibida. Você só pode excluir seus próprios produtos.");
        }

        await Produto.destroy({
            where: {
                id: produtoId
            }
        });

        console.log(`Produto ${produtoId} excluído com sucesso pelo usuário ${userId}.`);
        res.redirect("/produtos");

    } catch (error) {
        console.error(`Erro ao processar exclusão do produto ID ${produtoId}:`, error);
        res.status(500).send("Erro interno ao tentar excluir o produto.");
    }
});

export default router;