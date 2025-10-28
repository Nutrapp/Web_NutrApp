import { Sequelize } from "sequelize";
import connection from "../config/sequelize-config.js";

const ProdutoIngrediente = connection.define("produto_ingredientes", {
}, {
  
    indexes: [
        {
            unique: true,
            fields: ['produtoId', 'ingredienteId']
        }
    ]
});

export default ProdutoIngrediente;