// controllers/ProdutosController.js
import express from "express";
import Produto from "../models/produtos.js"; // IMPORTAÇÃO CORRIGIDA: DEVE SER 'produtos.js'
const router = express.Router();

// ROTA /produtos
router.get("/produtos", async function (req, res) {
    try {
        // 1. Ação do Model: Buscar todos os produtos no banco de dados.
        const produtos = await Produto.findAll({
            // Garante que os dados vêm como objetos JavaScript puros
            raw: true
        });

        // 2. Passar os dados para a View:
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

// --- ROTA GET para DETALHE DO PRODUTO (Sem View de Erro) ---
router.get("/produto/:id", async (req, res) => {
    const produtoId = req.params.id;

    try {
        // Busca o produto pelo ID (Primary Key)
        const produto = await Produto.findByPk(produtoId, {
            raw: true // Para obter dados puros
        });

        // Se o produto não for encontrado, redireciona para a lista principal
        if (!produto) {
            // Opcional: Aqui você pode usar uma biblioteca de mensagens flash 
            // para mostrar a mensagem "Produto não encontrado."
            return res.redirect("/produtos");
        }

        // Se encontrou, renderiza a view correta: viewsProdutos
        res.render("viewsProdutos", {
            produto: produto,
            usuarioLogado: req.session.Usuario
        });

    } catch (error) {
        console.error(`Erro ao buscar detalhes do produto ID ${produtoId}:`, error);
        // Em caso de erro de DB ou outra falha, redireciona para a lista principal
        res.redirect("/produtos");
    }
});


// // --- NOVA ROTA GET para BUSCAR produtos ---
// router.get("/produtos/search", async (req, res) => {
//     // Pega o termo de busca da query string (?query=...)
//     const searchTerm = req.query.query; 

//     // Verifica se há um termo de busca
//     if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
//         // Se não houver termo, redireciona para a lista completa
//         return res.redirect('/produtos'); 
//     }

//     const term = searchTerm.trim();

//     try {
//         const Produto = await getProdutoModel();
//         const produtos = await Produto.findAll({
//             where: {
//                 // Busca por nome_gen que CONTENHA o termo (case-insensitive se o DB for CI)
//                 nome_gen: {
//                     [Op.like]: `%${term}%` 
//                 }
//                 // Você pode adicionar mais campos aqui se quiser buscar em marca_produto também
//                 // [Op.or]: [
//                 //     { nome_gen: { [Op.like]: `%${term}%` } },
//                 //     { marca_produto: { [Op.like]: `%${term}%` } } 
//                 // ]
//             },
//             raw: true,
//             order: [['createdAt', 'DESC']]
//         });

//         // Renderiza a MESMA view 'produtos.ejs', mas passa o termo de busca
//         res.render("produtos", {
//             produtos: produtos, // Lista filtrada
//             usuarioLogado: req.session.Usuario,
//             searchTerm: term // Passa o termo para a view saber que é uma busca
//         });

//     } catch (error) {
//         console.error("Erro ao realizar busca de produtos:", error);
//         res.status(500).render("erro", {
//             mensagem: "Erro ao buscar produtos. Tente novamente."
//         });
//     }
// });

// // --- ROTAS DE EDIÇÃO (Existentes) ---
// // GET /produto/edit/:id (requireLogin)
// // POST /produto/update/:id (requireLogin)
// // POST /produto/delete/:id (requireLogin)
// // (Mantenha as rotas de edição e exclusão que você já tem aqui)
// // --- ROTA GET para exibir o FORMULÁRIO DE EDIÇÃO ---
// router.get("/produto/edit/:id", requireLogin, async (req, res) => {
//     const produtoId = req.params.id;
//     const userId = req.session.Usuario.id; 

//     try {
//         const Produto = await getProdutoModel();
//         const produto = await Produto.findByPk(produtoId);

//         if (!produto) {
//             return res.status(404).send("Produto não encontrado.");
//         }
//         if (produto.usuarioId !== userId) {
//             return res.status(403).send("Acesso negado.");
//         }
//         res.render("editProduto", { produto: produto.get({ plain: true }) });
//     } catch (error) {
//         console.error(`Erro ao buscar produto ID ${produtoId} para edição:`, error);
//         res.status(500).send("Erro ao carregar o formulário de edição.");
//     }
// });

// // --- ROTA POST para ATUALIZAR ---
// router.post("/produto/update/:id", requireLogin, async (req, res) => {
//     const produtoId = req.params.id;
//     const userId = req.session.Usuario.id; 
//     const { nome_gen, marca_produto, cod_barra, quantidade } = req.body;

//     try {
//         const Produto = await getProdutoModel();
//         const produto = await Produto.findByPk(produtoId);

//         if (!produto) {
//             return res.status(404).send("Produto não encontrado.");
//         }
//         if (produto.usuarioId !== userId) {
//              return res.status(403).send("Acesso negado.");
//         }

//         await produto.update({
//             nome_gen,
//             marca_produto,
//             cod_barra,
//             quantidade: quantidade ? parseInt(quantidade, 10) : produto.quantidade
//         });

//         res.redirect("/produtos"); 
//     } catch (error) {
//         console.error(`Erro ao atualizar produto ID ${produtoId}:`, error);
//         res.status(500).send("Erro ao salvar as alterações.");
//     }
// });

// // --- ROTA POST para EXCLUIR ---
// router.post("/produto/delete/:id", requireLogin, async (req, res) => {
//     const produtoId = req.params.id;
//     const userId = req.session.Usuario.id;

//     try {
//         const Produto = await getProdutoModel();
//         const produto = await Produto.findByPk(produtoId);

//         if (!produto) {
//             return res.status(404).send("Produto não encontrado.");
//         }
//         if (produto.usuarioId !== userId) {
//             return res.status(403).send("Acesso negado.");
//         }

//         // Opcional: Deletar imagem
//         const imagePath = path.join('public', produto.url_imagem_produto); 
//         if (fs.existsSync(imagePath)) {
//             try {
//                 fs.unlinkSync(imagePath);
//             } catch (imgErr) {
//                 console.error("Erro ao remover imagem:", imgErr);
//             }
//         }

//         await produto.destroy();
//         res.redirect("/produtos"); 

//     } catch (error) {
//         console.error(`Erro ao excluir produto ID ${produtoId}:`, error);
//         res.status(500).send("Erro ao excluir o produto.");
//     }
// });
// // --- FIM ROTAS CRUD ---

export default router;
