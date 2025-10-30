// controllers/ProdutosController.js
import express from "express";
import Produto from "../models/produtos.js";
import Usuario from "../models/usuario.js";
import Ingredientes from "../models/ingredientes.js";
import Alergenicos from "../models/alergenicos.js";
import { Op } from "sequelize";

const router = express.Router();

// helper: normaliza string (remove acentos, trim, lowercase)
function normalizeString(str) {
  return (str || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// verifica se um nome de alérgeno indica "sem alergênicos" (cobre variações)
function isSemAlergenico(normalizedName) {
  // procura por "sem" e "alerg" em qualquer posição
  return normalizedName.includes("sem") && normalizedName.includes("alerg");
}

// ROTA GET /produtos/pesquisar
router.get("/produtos/pesquisar", (req, res) => {
  res.redirect(`/produtos?q=${encodeURIComponent(req.query.q || "")}`);
});

// ROTA GET /produtos (Lista produtos e busca) - agora inclui ingredientes + alergênicos
router.get("/produtos", async function (req, res) {
  const termoPesquisa = req.query.q;
  const whereClause = {};
  if (termoPesquisa) whereClause.nome_gen = { [Op.like]: `%${termoPesquisa}%` };

  try {
    const produtos = await Produto.findAll({
      where: whereClause,
      include: [
        {
          model: Ingredientes,
          as: "ingredientes",
          through: { attributes: [] },
          include: [
            {
              model: Alergenicos,
              as: "alergenicos",
              through: { attributes: [] },
            },
          ],
        },
      ],
      order: [["id", "DESC"]],
      // não usar raw aqui para preservar métodos e includes
    });

    // Busca nomes dos usuários associados (como antes)
    const userIds = [
      ...new Set(produtos.map((p) => p.usuario_id_fk).filter((id) => id)),
    ];
    const usuarios = await Usuario.findAll({
      where: { id: userIds },
      attributes: ["id", "nome"],
      raw: true,
    });
    const userMap = {};
    usuarios.forEach((u) => (userMap[u.id] = u.nome));

    // Serializar produtos e gerar aviso de alergênicos (ignorando "Sem alergênicos")
    const produtosComNome = produtos.map((pInstance) => {
      const p = pInstance.toJSON();
      const alergSet = new Set();

      (p.ingredientes || []).forEach((ing) => {
        (ing.alergenicos || []).forEach((a) => {
          const nomeOriginal = (a.nome || "").toString();
          const normalized = normalizeString(nomeOriginal);
          if (!isSemAlergenico(normalized)) {
            alergSet.add(nomeOriginal);
          }
        });
      });

      const alergens = Array.from(alergSet);
      const aviso =
        alergens.length > 0
          ? `Atenção — contém: ${alergens.join(
              ", "
            )}. Se você tem alergia a qualquer um desses ingredientes, não consuma.`
          : "Sem alergênicos.";

      return {
        ...p,
        nomeCadastrador: p.usuario_id_fk
          ? userMap[p.usuario_id_fk] || "Não Encontrado"
          : "Não Registrado",
        aviso,
      };
    });

    const usuarioLogado = req.session.Usuario || null;

    res.render("produtos", {
      produtos: produtosComNome,
      usuarioLogado,
      termoPesquisa: termoPesquisa || "",
    });
  } catch (error) {
    console.error(
      `Erro ao buscar produtos (Termo: ${termoPesquisa || "Nenhum"}):`,
      error
    );
    res.status(500).render("erro", {
      mensagem: "Não foi possível carregar os produtos. Tente novamente.",
    });
  }
});

// ROTA GET /produto/:id (Detalhes do produto)
router.get("/produto/:id", async (req, res) => {
  const produtoId = req.params.id;
  const usuarioLogado = req.session.Usuario || null;
  let nomeCadastrador = "Usuário Não Encontrado";

  try {
    const produto = await Produto.findByPk(produtoId, {
      include: [
        {
          model: Ingredientes,
          as: "ingredientes",
          through: { attributes: [] },
          include: [
            {
              model: Alergenicos,
              as: "alergenicos",
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!produto) return res.redirect("/produtos");

    if (produto.usuario_id_fk) {
      const cadastrador = await Usuario.findByPk(produto.usuario_id_fk, {
        raw: true,
      });
      if (cadastrador && cadastrador.nome) nomeCadastrador = cadastrador.nome;
    }

    const produtoJSON = produto.toJSON();

    // Gera lista única de alérgenos associados, IGNORANDO "Sem alergênicos"
    const alergensSet = new Set();
    (produtoJSON.ingredientes || []).forEach((ing) => {
      (ing.alergenicos || []).forEach((a) => {
        const nomeOriginal = (a.nome || "").toString();
        const normalized = normalizeString(nomeOriginal);
        if (!isSemAlergenico(normalized)) {
          alergensSet.add(nomeOriginal);
        }
      });
    });
    const alergiasDetectadas = Array.from(alergensSet);

    res.render("viewsProdutos", {
      produto: produtoJSON,
      usuarioLogado,
      nomeCadastrador,
      alergiasDetectadas,
    });
  } catch (error) {
    console.error(`Erro ao buscar detalhes do produto ID ${produtoId}:`, error);
    res.redirect("/produtos");
  }
});

// ROTA POST /produtos/delete/:id (delete seguro)
router.post("/produtos/delete/:id", async (req, res) => {
  const produtoId = req.params.id;
  const userId = req.session.Usuario ? req.session.Usuario.id : null;

  if (!userId) return res.status(401).send("Acesso negado. Faça login.");

  try {
    const produto = await Produto.findByPk(produtoId);
    if (!produto) return res.redirect("/produtos");

    if (String(produto.usuario_id_fk) !== String(userId))
      return res.status(403).send("Ação proibida. Só seu produto.");

    await Produto.destroy({ where: { id: produtoId } });
    res.redirect("/produtos");
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    res.status(500).send("Erro interno.");
  }
});

export default router;