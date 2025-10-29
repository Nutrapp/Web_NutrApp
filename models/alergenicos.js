import { Sequelize } from "sequelize";
import connection from "../config/sequelize-config.js";

const alergenicos = connection.define("alergenicos", {
  nome: { type: Sequelize.STRING, allowNull: false, unique: true },
  descricao: { type: Sequelize.TEXT, allowNull: true }
});

await alergenicos.sync({ force: false });
export default alergenicos;
