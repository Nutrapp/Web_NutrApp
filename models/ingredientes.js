import { Sequelize } from "sequelize";
import connection from "../config/sequelize-config.js";

const Ingrediente = connection.define("ingredientes", {
    nome: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
});

export default Ingrediente; 