import { Sequelize } from "sequelize";
import connection from "../config/sequelize-config.js";

const IngredientesAlergenicos = connection.define("ingredientes_alergenicos", {
  ingredienteId: { type: Sequelize.INTEGER, allowNull: false },
  alergenoId: { type: Sequelize.INTEGER, allowNull: false }
}, { timestamps: false });

await IngredientesAlergenicos.sync({ force: false });
export default IngredientesAlergenicos;
