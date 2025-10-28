import express from "express";
const app = express();
import session from 'express-session';

app.use(session({
    secret: "123",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000
    }
}));

import UsuarioController from "./controllers/UsuarioController.js";
import ProdutosController from "./controllers/ProdutosController.js";
import AddProdutosController from "./controllers/AddProdutosController.js";
import EditProdutosController from "./controllers/EditProdutosController.js";
// import adicionarProdutos from "./controllers/adicionarProdutos.js";

// import ingredientesRouter from './controllers/IngredientesController.js';


// import Ingrediente from "./models/ingredientes.js";
// import ProdutoIngrediente from "./models/produtoIngrediente.js";
// import Usuario from "./models/usuario.js";
// import Produto from "./models/produtos.js";

// import defineAssociations from "./config/associations.js";
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", UsuarioController);
app.use("/", ProdutosController);
app.use("/", AddProdutosController);
app.use("/", EditProdutosController);
// // app.use("/", adicionarProdutos);
// app.use("/", UsuarioController);
// app.use("/", ProdutosController);
// app.use("/", AddProdutosController);
// app.use(ingredientesRouter);


app.set("view engine", "ejs");

app.use(express.static("public"));

app.get("/", function (req, res) {
    res.render("index");
});

// defineAssociations();

// Promise.all([
//     Usuario.sync({ force: false }),
//     Produto.sync({ force: false }),
//     Ingrediente.sync({ force: false }),
// ])
//     .then(() => {
//         console.log("Tabelas primárias (Usuario, Produto, Ingrediente) criadas com sucesso.");

//         return ProdutoIngrediente.sync({ force: false });
//     })
//     .then(() => {
//         console.log("Tabela pivot (ProdutoIngrediente) criada com sucesso.");
//         console.log("Estrutura do banco de dados pronta!");
//     })
//     .catch((error) => {
//         console.log("Erro na criação das tabelas: " + error);
//     });

const port = 8080;
app.listen(port, function (error) {
    if (error) {
        console.log(`Não foi possível iniciar o servidor. Erro: ${error}`);
    } else {
        console.log(`Servidor iniciado com sucesso em http://localhost:${port} !`);
    }
}); 