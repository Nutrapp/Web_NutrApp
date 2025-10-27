import express from "express";
const app = express();
import session from 'express-session';

app.use(session({
  secret: "123", // Chave usada para assinar o cookie de sessão
  resave: false,                      // Não salva a sessão se não houver alterações
  saveUninitialized: false,           // Não cria uma sessão até que algo seja armazenado
  cookie: {
    maxAge: 3600000 // Tempo de vida do cookie (1 hora em milissegundos)
  }
}));


import UsuarioController from "./controllers/UsuarioController.js";
import ProdutosController from "./controllers/ProdutosController.js";
import AddProdutosController from "./controllers/AddProdutosController.js";
import ingredientesRouter from './controllers/IngredientesController.js';

import Ingrediente from "./models/ingredientes.js";
import ProdutoIngrediente from "./models/produtoIngrediente.js";
import Usuario from "./models/usuario.js";
import Produto from "./models/produtos.js";
import defineAssociations from "./config/associations.js";

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use("/", UsuarioController);
app.use("/", ProdutosController);
app.use("/", AddProdutosController);
app.use(ingredientesRouter);


defineAssociations();

Promise.all([
  Usuario.sync({ force: false }),
  Produto.sync({ force: false }),
  Ingrediente.sync({ force: false }),
])
  .then(() => {
    // 2. APENAS APÓS O SUCESSO DAS PRIMÁRIAS, SINCRONIZE A TABELA PIVOT (FILHA)
    console.log("Tabelas primárias (Usuario, Produto, Ingrediente) criadas com sucesso.");

    // Retornamos a Promise do sync para o próximo .then()
    return ProdutoIngrediente.sync({ force: false });
  })
  .then(() => {
    console.log("Tabela pivot (ProdutoIngrediente) criada com sucesso.");
    console.log("Estrutura do banco de dados pronta!");
    // Inicie seu servidor Express aqui.
  })
  .catch((error) => {
    console.log("Erro na criação das tabelas: " + error);
  });

app.set("view engine", "ejs");

app.use(express.static("public"));

app.get("/", function (req, res) {
  res.render("index");
});

// INICIA O SERVIDOR NA PORTA 8080
const port = 8080;
app.listen(port, function (error) {
  if (error) {
    console.log(`Não foi possível iniciar o servidor. Erro: ${error}`);
  } else {
    console.log(`Servidor iniciado com sucesso em http://localhost:${port} !`);
  }
}); 