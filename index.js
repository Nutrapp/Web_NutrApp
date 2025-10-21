import express from "express";
const app = express();

import cadastroController from "./controllers/cadastroController.js";
import loginController from "./controllers/loginController.js";

app.use("/",cadastroController);
app.use("/",loginController);

app.set("view engine", "ejs");

app.use(express.static("public"));

app.get("/", function (req, res) {
  res.render("index");
});

// app.get("/cadastro", function (req, res) {
//   res.render("cadastro");
// });

// app.get("/login", function (req, res) {
//   res.render("login");
// });

// INICIA O SERVIDOR NA PORTA 8080
const port = 8080;
app.listen(port, function (error) {
  if (error) {
    console.log(`Não foi possível iniciar o servidor. Erro: ${error}`);
  } else {
    console.log(`Servidor iniciado com sucesso em http://localhost:${port} !`);
  }
});
