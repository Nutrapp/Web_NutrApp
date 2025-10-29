import Ingredientes from "../models/ingredientes.js";
import Alergenicos from "../models/alergenicos.js";
import IngredientesAlergenicos from "../models/ingredientesAlergenicos.js";
import Produto from "../models/produtos.js";
import ProdutosIngredientes from "../models/ProdutosIngredientes.js";

// ------------------------------
// Ingredientes ↔ Alergenicos (N:N)
// ------------------------------
Ingredientes.belongsToMany(Alergenicos, {
  through: IngredientesAlergenicos,
  foreignKey: "ingredienteId",
  otherKey: "alergenoId",
  as: "alergenicos"
});

Alergenicos.belongsToMany(Ingredientes, {
  through: IngredientesAlergenicos,
  foreignKey: "alergenoId",
  otherKey: "ingredienteId",
  as: "ingredientes"
});

// ------------------------------
// Produtos ↔ Ingredientes (N:N)
// ------------------------------
Produto.belongsToMany(Ingredientes, {
  through: ProdutosIngredientes,
  foreignKey: "produtoId",
  otherKey: "ingredienteId",
  as: "ingredientes"
});

Ingredientes.belongsToMany(Produto, {
  through: ProdutosIngredientes,
  foreignKey: "ingredienteId",
  otherKey: "produtoId",
  as: "produtos"
});

console.log("✅ Associações entre tabelas configuradas com sucesso!");
