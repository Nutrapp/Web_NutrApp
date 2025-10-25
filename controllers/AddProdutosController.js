import express from "express";
import Produto from "../models/produtos.js"; // Importa o modelo Sequelize
import multer from "multer"; // Para lidar com o upload de arquivos
import path from "path"; // Módulo nativo para manipulação de caminhos

const router = express.Router();

// ----------------------------------------
// --- 1. CONFIGURAÇÃO DO MULTER (UPLOAD) ---
// ----------------------------------------
// Define onde o arquivo será salvo e como será nomeado
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Altere este caminho se a sua pasta de uploads for diferente
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
    res.render("addProdutos");
});

// Rota POST para processar o formulário e salvar no DB
// 'upload.single('imagemProduto')' é o middleware que processa:
// 1. O arquivo (req.file)
// 2. Os campos de texto (req.body)
router.post("/Produto", upload.single('imagemProduto'), async (req, res) => {
    
    // ATENÇÃO: req.body AGORA está populado pelo Multer
    const { 
        cod_barra, 
        nome_gen, 
        marca_produto, 
        quantidade 
        // Se você tiver outros campos no formulário (ex: ingredientes, infoNutricionais), adicione-os aqui
    } = req.body;
    
    // Captura o caminho do arquivo (se houver upload)
    const caminhoImagem = req.file ? `/uploads/${req.file.filename}` : null;
    const qtd = parseInt(quantidade, 10);
    
    // A chave 'url_imagem_produto' é o que salva o caminho no DB
    const url_imagem_produto = caminhoImagem;

    // A chave 'qualidade_produto' deve ser definida se estiver no modelo
    const qualidade_produto = req.body.qualidade_produto || null; // Adicionado para sua referência

    // Validação
    if (!cod_barra || !nome_gen || !marca_produto || !url_imagem_produto) {
        console.error("Dados do formulário incompletos ou imagem faltando. Produto não salvo.");
        // Você pode deletar o arquivo que o Multer já salvou aqui, se houver: fs.unlinkSync(req.file.path)
        return res.status(400).send("Erro: Preencha todos os campos e envie uma imagem.");
    }

    try {
        // Salva o produto no banco de dados
        await Produto.create({
            cod_barra: cod_barra,
            nome_gen: nome_gen,
            marca_produto: marca_produto,
            quantidade: qtd, // Garantindo que a quantidade seja salva
            qualidade_produto: qualidade_produto, // Se este campo existir no seu modelo
            url_imagem_produto: url_imagem_produto, 
            // usuario_id_fk: req.session.userId, // Adicione a FK se estiver usando autenticação
        });

        console.log(`Produto "${nome_gen}" salvo com sucesso!`);
        // Após salvar, redirecione para a página de produtos
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