import express from "express";
const app = express();
import session from 'express-session';


// ... Outros middlewares como express.urlencoded e express.json ...

// 2. Configurar o middleware de sessão
app.use(session({
    secret: "suaChaveSecretaMuitoForte", // Chave usada para assinar o cookie de sessão
    resave: false,                      // Não salva a sessão se não houver alterações
    saveUninitialized: false,           // Não cria uma sessão até que algo seja armazenado
    cookie: { 
        maxAge: 3600000 // Tempo de vida do cookie (1 hora em milissegundos)
    }
}));


import UsuarioController from "./controllers/UsuarioController.js";
// --- INÍCIO DA CORREÇÃO ---
// Middleware para decodificar dados de formulários HTML (URL-encoded)
app.use(express.urlencoded({ extended: true }));

// Middleware para decodificar payloads JSON (útil para APIs)
app.use(express.json());
// --- FIM DA CORREÇÃO ---

app.use("/",UsuarioController);

app.set("view engine", "ejs");

app.use(express.static("public"));

app.get("/", function (req, res) {
    res.render("index");
});


 // 1. Importar o módulo




// 3. Suas rotas devem ser carregadas DEPOIS do middleware de sessão
// app.use("/", router);
// app.use(suasOutrasRotas);

// ... Resto do seu código

// app.get("/cadastro", function (req, res) {
//   res.render("cadastro");
// });

// app.get("/login", function (req, res) {
//   res.render("login");
// });

// INICIA O SERVIDOR NA PORTA 3000
const port = 3000;
app.listen(port, function (error) {
    if (error) {
        console.log(`Não foi possível iniciar o servidor. Erro: ${error}`);
    } else {
        console.log(`Servidor iniciado com sucesso em http://localhost:${port} !`);
    }
}); 