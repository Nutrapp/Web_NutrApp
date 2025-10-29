import { Sequelize } from "sequelize";
import connection from "../config/sequelize-config.js";

const produtosIngredientes = connection.define("produtos_ingredientes", {
  produtoId: { type: Sequelize.INTEGER, allowNull: false },
  ingredienteId: { type: Sequelize.INTEGER, allowNull: false }
}, { timestamps: false });

await produtosIngredientes.sync({ force: false });
export default produtosIngredientes;
