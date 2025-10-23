import express from "express";
const app = express();
import session from 'express-session';

app.use(session({
    secret: "suaChaveSecretaMuitoForte", // Chave usada para assinar o cookie de sessão
    resave: false,                      // Não salva a sessão se não houver alterações
    saveUninitialized: false,           // Não cria uma sessão até que algo seja armazenado
    cookie: { 
        maxAge: 3600000 // Tempo de vida do cookie (1 hora em milissegundos)
    }
}));


import UsuarioController from "./controllers/UsuarioController.js";
import ProdutosController from "./controllers/ProdutosController.js"

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use("/",UsuarioController);
app.use("/",ProdutosController);

app.set("view engine", "ejs");

app.use(express.static("public"));

app.get("/", function (req, res) {
    res.render("index");
});

// INICIA O SERVIDOR NA PORTA 3000
const port = 3000;
app.listen(port, function (error) {
    if (error) {
        console.log(`Não foi possível iniciar o servidor. Erro: ${error}`);
    } else {
        console.log(`Servidor iniciado com sucesso em http://localhost:${port} !`);
    }
}); 