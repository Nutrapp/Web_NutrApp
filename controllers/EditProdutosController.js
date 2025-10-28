import express from 'express';
import Produto from '../models/produtos.js';
import upload from '../middleware/uploadMiddleware.js'; 
import fs from 'fs'; 
import path from 'path'; 

const router = express.Router();

async function editProduto(req, res) {
    const produtoId = req.params.id;
    const usuarioLogado = req.session.Usuario || null;

    try {
        const produto = await Produto.findByPk(produtoId);

        if (!produto) {
            console.error(`Produto ID ${produtoId} não encontrado para edição.`);
            return res.status(404).send(`Produto ID ${produtoId} não encontrado.`);
        }

        res.render('editProdutos', {
            produto: produto.toJSON(),
            usuarioLogado: usuarioLogado
        });

    } catch (error) {
        console.error("Erro ao carregar produto para edição:", error);
        res.status(500).send("Erro interno do servidor ao buscar o produto para edição.");
    }
}


async function updateProduto(req, res) {
    const produtoId = req.params.id;

    const {
        nome_gen,
        marca_produto,
        cod_barra,
        quantidade,
        url_imagem_existente 
    } = req.body;
    
    let url_imagem_produto = url_imagem_existente;
    let url_imagem_antiga = url_imagem_existente;

    try {
        const produtoAntigo = await Produto.findByPk(produtoId);
        if (produtoAntigo) {
            url_imagem_antiga = produtoAntigo.url_imagem_produto;
        }

        if (req.file && req.file.filename) {
            url_imagem_produto = `/uploads/${req.file.filename}`;
            console.log("Nova imagem enviada:", url_imagem_produto);
        } else {
            console.log("Mantendo imagem existente:", url_imagem_produto);
        }

        const [numLinhasAtualizadas] = await Produto.update({
            nome_gen,
            marca_produto,
            cod_barra,
            // Garante que 'quantidade' é um número
            quantidade: quantidade ? parseInt(quantidade, 10) : null,
            url_imagem_produto // Salva a nova URL ou a URL existente
        }, {
            where: { id: produtoId }
        });

        if (numLinhasAtualizadas > 0) {
            console.log(`Produto ID ${produtoId} atualizado com sucesso.`);
            
            // 4. Lógica de Exclusão da Imagem Antiga
            // Condição: Nova imagem foi salva E o produto tinha uma imagem antiga válida
            if (req.file && url_imagem_antiga && url_imagem_antiga !== url_imagem_produto) {
                
                // Extrai o nome do arquivo da URL (ex: "nome_do_arquivo.jpg")
                const nomeArquivoAntigo = path.basename(url_imagem_antiga);
                
                // CONSTRUÇÃO ROBUSTA DO CAMINHO FÍSICO
                // Usa process.cwd() para obter a raiz da aplicação e constrói o caminho absoluto:
                // [Raiz_do_App]/public/uploads/nome_do_arquivo.jpg
                const caminhoFisicoAntigo = path.join(process.cwd(), 'public', 'uploads', nomeArquivoAntigo);
                
                // Verifica se o arquivo existe antes de tentar deletar
                if (fs.existsSync(caminhoFisicoAntigo)) {
                    fs.unlink(caminhoFisicoAntigo, (err) => {
                        if (err) {
                            console.error(`[ERRO FS] Falha ao deletar imagem antiga: ${caminhoFisicoAntigo}`, err);
                        } else {
                            console.log(`[SUCESSO FS] Imagem antiga deletada: ${caminhoFisicoAntigo}`);
                        }
                    });
                } else {
                    console.warn(`[AVISO FS] Imagem antiga não encontrada no disco para exclusão: ${caminhoFisicoAntigo}`);
                }
            }

            // 5. Redirecionamento de Sucesso
            res.redirect(`/produto/${produtoId}`);
            
        } else {
            console.warn(`Produto ID ${produtoId} não encontrado para atualização (ou dados eram iguais).`);
            
            // Se o DB falhou na atualização, mas o Multer salvou um arquivo, o deletamos.
            if (req.file) {
                 fs.unlink(req.file.path, (err) => {
                    if (err) console.error(`[ERRO FS] Falha ao deletar arquivo recém-salvo não utilizado: ${req.file.path}`, err);
                    else console.log(`[SUCESSO FS] Arquivo recém-salvo não utilizado deletado: ${req.file.path}`);
                });
            }
            res.status(404).send("Produto não encontrado ou nenhuma alteração foi feita.");
        }

    } catch (error) {
        // Se houver um erro, garante que o arquivo recém-salvo pelo Multer seja deletado
        if (req.file) {
             fs.unlink(req.file.path, (err) => {
                if (err) console.error(`[ERRO FS] Falha ao deletar arquivo recém-salvo após erro no DB: ${req.file.path}`, err);
            });
        }
        
        console.error("Erro ao atualizar produto:", error);
        res.status(500).send("Erro interno do servidor ao atualizar o produto.");
    }
}


// --- Definição de Rotas ---

router.get('/produto/edit/:id', editProduto);

// Rota POST: Inclui o middleware Multer com tratamento de erro
router.post('/produto/update/:id', (req, res, next) => {
    upload.single('imagemProduto')(req, res, (err) => {
        // Se houver um erro do Multer (ex: arquivo muito grande, tipo inválido)
        if (err) {
            console.error("Erro do Multer durante o upload:", err.message);
            // Você pode adicionar a lógica para re-renderizar a página de edição aqui 
            // e passar a mensagem de erro.
            return res.status(400).send(`Erro no upload da imagem: ${err.message}`);
        }
        // Se não houver erro, continua para a próxima função (updateProduto)
        next();
    });
}, updateProduto);

export default router;
