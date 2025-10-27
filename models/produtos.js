import { Sequelize } from "sequelize";
import connection from "../config/sequelize-config.js"; // Nome da tabela
const Produto = connection.define("produtos", {
  cod_barra: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  nome_gen: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  marca_produto: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  url_imagem_produto: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  usuario_id:{
    type: Sequelize.INTEGER,
    allowNull: false,
  }
});

//Produto.sync({ force: false });

export default Produto;
