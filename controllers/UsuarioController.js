import express from "express";
import Usuario from "../models/usuario.js";
const router = express.Router();
import bcrypt from "bcrypt";

router.get("/login", (req, res) => {
  res.render("login", {
    loggedOut: true,
  });
});

router.get("/logout", (req, res) => {
  req.session.Usuario = undefined;
  res.redirect("/");
});

router.get("/cadastro", (req, res) => {
  res.render("cadastro", {
    loggedOut: true,
  });
});

router.post("/cadastro/new", (req, res) => {
  const nome = req.body.nome;
  const email = req.body.email;
  const senha = req.body.senha;

  Usuario.findOne({ where: { email: email } })
    .then((usuarioEncontrado) => {
      if (usuarioEncontrado == undefined) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(senha, salt);

        Usuario.create({
          nome: nome,
          email: email,
          senha: hash,
        })
          .then(() => {
            res.redirect("/login");
          })
          .catch((err) => {
            console.error("Erro ao criar usuário:", err);
            res.send("Erro ao cadastrar. Tente novamente.");
          });

      } else {
        res.send(`Usuário já cadastrado!
            <br><a href="/cadastro">Tentar novamente.</a>`);
      }
    })
    .catch((err) => {
      console.error("Erro ao buscar usuário:", err);
      res.send("Erro ao buscar dados. Tente novamente.");
    });
});

router.post("/authenticate", (req, res) => {
  const email = req.body.email;
  const senha = req.body.senha;

  Usuario.findOne({ where: { email: email } }).then((Usuario) => {
    if (Usuario != undefined) {
      const correct = bcrypt.compareSync(senha, Usuario.senha);
      if (correct) {
        req.session.Usuario = {
          id: Usuario.id,
          email: Usuario.email,
          nome: Usuario.nome
        };
        res.redirect("/produtos");
      } else {
        res.send(`Senha inválida!
        <br><a href="/login">Tentar novamente.</a>`);
      }
    } else {
      res.send(`Usuário não existe.
      <br><a href="/login">Tentar novamente.</a>`);
    }
  })
  .catch(err => {
      console.error("Erro fatal na rota /authenticate:", err);
      res.status(500).send("Erro interno ao autenticar. Verifique o console do servidor.");
    });
});

export default router;
