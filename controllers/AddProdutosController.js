import express from "express";
import Produto from "../models/produtos.js";
import multer from "multer";
import path from "path";

const router = express.Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        // Gera um nome único: cod_barra-timestamp.extensao
        const codBarra = req.body.cod_barra || 'produto-sem-barra';
        const ext = path.extname(file.originalname);
        cb(null, `${codBarra}-${Date.now()}${ext}`);
    }
});

// Inicializa o middleware Multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB
});
// ----------------------------------------


// Rota GET para exibir o formulário
router.get("/addProdutos", (req, res) => {

    const userId = req.session.Usuario; // Exemplo comum

    if (!userId) {
        return res.redirect('/login');
    }

    const usuarioParaEJS = { id: userId };
    res.render("addProdutos", {
        usuario: usuarioParaEJS
    });
});

router.post("/Produto", upload.single('imagemProduto'), async (req, res) => {

    const {
        cod_barra,
        nome_gen,
        marca_produto,
        quantidade
    } = req.body;

    const usuario_id_logado = req.session.Usuario ? req.session.Usuario.id : null;

    // Validação de segurança
    if (!usuario_id_logado) {
        console.error("Tentativa de cadastro sem usuário logado. Produto não salvo.");
        return res.status(401).send("Erro: Você precisa estar logado para cadastrar um produto.");
    }

    const caminhoImagem = req.file ? `/uploads/${req.file.filename}` : null;
    const qtd = parseInt(quantidade, 10);
    const url_imagem_produto = caminhoImagem;
    const qualidade_produto = req.body.qualidade_produto || null;

    if (!cod_barra || !nome_gen || !marca_produto || !url_imagem_produto) {
        console.error("Dados do formulário incompletos ou imagem faltando. Produto não salvo.");
        return res.status(400).send("Erro: Preencha todos os campos e envie uma imagem.");
    }

    try {
        // Salva o produto no banco de dados
        const novoProduto = await Produto.create({
            cod_barra: cod_barra,
            nome_gen: nome_gen,
            marca_produto: marca_produto,
            quantidade: qtd,
            url_imagem_produto: url_imagem_produto,
            usuario_id: usuario_id_logado,
        });

        console.log(`Produto "${nome_gen}" salvo com sucesso! ID: ${novoProduto.id}`);
        res.redirect(`/ingredientes/adicionar/${novoProduto.id}`);

    } catch (error) {
        console.error("Erro ao salvar produto no banco de dados:", error);
        res.status(500).send(`
            <h1>Erro ao cadastrar produto:</h1>
            <p>${error.message}</p>
            <p><a href="/addProdutos">Voltar ao formulário</a></p>
        `);
    }
});

export default router;