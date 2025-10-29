import alergenicos from "../models/alergenicos.js";
import Ingrediente from "../models/ingredientes.js";

const alergenicos = [
  "Ovos", "Leite", "Aditivos alimentares", "Sacarose", "Frutose",
  "Lactose", "Glúten", "Alimentos vegetais", "Farinhas e grãos",
  "Refrigerantes", "Café e chocolate", "Trigo", "Soja",
  "Amendoim e oleaginosas", "Crustáceos", "Peixes"
];

// cria alergenicos
for (const nome of alergenicos) {
  await alergenicos.findOrCreate({ where: { nome } });
}

// agora alguns ingredientes de exemplo, cada um ligado a pelo menos 1 alergenicos
const ingredientesMap = [
  { nome: "Farinha de trigo", alerg: ["Trigo", "Glúten", "Farinhas e grãos"] },
  { nome: "Leite integral", alerg: ["Leite", "Lactose"] },
  { nome: "Amendoim torrado", alerg: ["Amendoim e oleaginosas"] },
  { nome: "Ovo de galinha", alerg: ["Ovos"] },
  { nome: "Chocolate ao leite", alerg: ["Leite", "Lactose", "Café e chocolate"] },
  { nome: "Soja texturizada", alerg: ["Soja"] },
  { nome: "Camaroes (crustáceo)", alerg: ["Crustáceos", "Peixes"] },
  { nome: "Açúcar (sacarose)", alerg: ["Sacarose"] },
  { nome: "Frutose natural (frutas)", alerg: ["Frutose", "Alimentos vegetais"] },
  { nome: "Sal", alerg: [] } // exemplo de ingrediente neutro
];

for (const it of ingredientesMap) {
  const [ing] = await Ingrediente.findOrCreate({ where: { nome: it.nome } });
  for (const alergNome of it.alerg) {
    const alerg = await alergenicos.findOne({ where: { nome: alergNome } });
    if (alerg) {
      await ing.addalergenicos(alerg); // Sequelize magic: cria relação
    }
  }
}
console.log("Seed concluído.");
process.exit(0);
