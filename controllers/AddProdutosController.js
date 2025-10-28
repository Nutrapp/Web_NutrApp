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
        const codBarra = req.body.cod_barra || 'produto-sem-barra';
        const ext = path.extname(file.originalname);
        cb(null, `${codBarra}-${Date.now()}${ext}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});


router.get("/addProdutos", (req, res) => {
    if (!req.session.Usuario || !req.session.Usuario.id) {
        return res.redirect("/login"); 
    }
    res.render("addProdutos", {
        usuarioLogado: req.session.Usuario
    });
});

router.post("/Produto", upload.single('imagemProduto'), async (req, res) => {
    
    const userId = req.session.Usuario ? req.session.Usuario.id : null;
    if (!userId) {
        console.error("Tentativa de postagem sem usuário logado.");
        return res.status(401).send("Acesso não autorizado. Faça login para cadastrar produtos.");
    }
    const { 
        cod_barra, 
        nome_gen, 
        marca_produto, 
        quantidade,
    } = req.body;
    
    const caminhoImagem = req.file ? `/uploads/${req.file.filename}` : null;
    const qtd = parseInt(quantidade, 10);
    const url_imagem_produto = caminhoImagem;

    if (!cod_barra || !nome_gen || !marca_produto || !url_imagem_produto) {
        console.error("Dados do formulário incompletos ou imagem faltando. Produto não salvo.");
        return res.status(400).send("Erro: Preencha todos os campos e envie uma imagem.");
    }

    try {
        await Produto.create({
            cod_barra: cod_barra,
            nome_gen: nome_gen,
            marca_produto: marca_produto,
            quantidade: qtd, 
            url_imagem_produto: url_imagem_produto, 
            usuario_id_fk: userId, 
        });

        console.log(`Produto "${nome_gen}" salvo com sucesso! (ID do Dono: ${userId})`);
        res.redirect("/produtos"); 

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
