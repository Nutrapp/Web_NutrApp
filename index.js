// index.js (corrigido — cole por cima do seu)
import express from "express";
const app = express();

import session from "express-session";
import "./config/associations.js"; // executa associações (sem export)
 
// Models / DB (necessário para seed e sync)
import connection from "./config/sequelize-config.js";
import Produto from "./models/produtos.js";
import Ingredientes from "./models/ingredientes.js";
import Alergenicos from "./models/alergenicos.js";
import produtosIngredientes from "./models/ProdutosIngredientes.js";
import ingredientesAlergenicos from "./models/ingredientesAlergenicos.js";

// ----- Middlewares -----
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ----- Sessão: deve vir ANTES de registrar as rotas/controllers -----
app.use(
  session({
    secret: "123",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 },
  })
);

// ----- Controllers (só após session) -----
import UsuarioController from "./controllers/UsuarioController.js";
import ProdutosController from "./controllers/ProdutosController.js";
import AddProdutosController from "./controllers/AddProdutosController.js";
import EditProdutosController from "./controllers/EditProdutosController.js";

app.use("/", UsuarioController);
app.use("/", ProdutosController);
app.use("/", AddProdutosController);
app.use("/", EditProdutosController);

// ----- View engine / static -----
app.set("view engine", "ejs");
app.use(express.static("public"));

// Rota principal
app.get("/", (req, res) => {
  res.render("index");
});

// ----------------------------
// Sincroniza DB e popula seed
// ----------------------------
(async () => {
  try {
    await connection.sync({ force: false });
    console.log("Banco sincronizado com sucesso.");

    console.log("Seed de alérgenos e ingredientes concluído (se aplicável).");
  } catch (err) {
    console.error("Erro ao sincronizar/seed:", err);
  }
})();

// Inicia servidor
const port = 8080;
app.listen(port, function (error) {
  if (error) {
    console.log(`Não foi possível iniciar o servidor. Erro: ${error}`);
  } else {
    console.log(`Servidor iniciado com sucesso em http://localhost:${port} !`);
  }
});
