import express from "express";
import Usuario from "../models/usuario.js";
const router = express.Router();
// Importando bcrypt (hash de senha)
import bcrypt from "bcrypt";

// ROTA DE LOGIN
router.get("/login", (req, res) => {
  res.render("login", {
    loggedOut: true,
  });
});

// ROTA DE LOGOUT
router.get("/logout", (req, res) => {
  req.session.Usuario = undefined;
  res.redirect("/");
});

// ROTA DE CADASTRO DE USUÁRIO
router.get("/cadastro", (req, res) => {
  res.render("cadastro", {
    loggedOut: true,
  });
});

// ROTA DE CRIAÇÃO DE USUÁRIO NO BANCO
router.post("/cadastro/new", (req, res) => {
  const nome = req.body.nome;
  const email = req.body.email;
  const senha = req.body.senha;

  // 1. Renomeie o argumento da função callback para algo como 'usuarioEncontrado'
  Usuario.findOne({ where: { email: email } })
    .then((usuarioEncontrado) => {
      // 2. A verificação está correta (o Sequelize retorna null se não encontrar)
      if (usuarioEncontrado == undefined) {
        // AQUI SERÁ FEITO O CADASTRO
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(senha, salt);

        // 3. Chame o .create() no MODELO 'Usuario' (o importado)
        Usuario.create({
          nome: nome,
          email: email,
          senha: hash,
        })
          .then(() => {
            res.redirect("/login");
          })
          .catch((err) => {
            // Adicione tratamento de erro para o CREATE
            console.error("Erro ao criar usuário:", err);
            res.send("Erro ao cadastrar. Tente novamente.");
          });

        // CASO JÁ EXISTA UM USUÁRIO CADASTRADO COM O MESMO E-MAIL
      } else {
        res.send(`Usuário já cadastrado!
            <br><a href="/cadastro">Tentar novamente.</a>`);
      }
    })
    .catch((err) => {
      // Adicione tratamento de erro para o FINDONE
      console.error("Erro ao buscar usuário:", err);
      res.send("Erro ao buscar dados. Tente novamente.");
    });
});

// ROTA DE AUTENTICAÇÃO
router.post("/authenticate", (req, res) => {
  const email = req.body.email;
  const senha = req.body.senha;

  // BUSCA O USUÁRIO NO BANCO
  Usuario.findOne({ where: { email: email } }).then((Usuario) => {
    // SE O USUÁRIO EXISTIR
    if (Usuario != undefined) {
      // VALIDA A SENHA
      const correct = bcrypt.compareSync(senha, Usuario.senha);
      // SE A SENHA FOR VÁLIDA
      if (correct) {
        // AUTORIZA O LOGIN
        req.session.Usuario = {
          id: Usuario.id,
          email: Usuario.email,
        };
        res.redirect("/");
        // SE A SENHA NÃO FOR VÁLIDA
      } else {
        // EXIBE A MENSAGEM
        res.send(`Senha inválida!
        <br><a href="/login">Tentar novamente.</a>`);
      }
      // SE O USÁRIO NÃO EXISTIR
    } else {
      // EXIBE A MENSAGEM
      res.send(`Usuário não existe.
      <br><a href="/login">Tentar novamente.</a>`);
    }
  })
  .catch(err => {
      // ESTE CATCH AGORA GARANTE QUE A REQUISIÇÃO NUNCA FICARÁ PENDENTE
      console.error("Erro fatal na rota /authenticate:", err);
      res.status(500).send("Erro interno ao autenticar. Verifique o console do servidor.");
    });
});

export default router;
