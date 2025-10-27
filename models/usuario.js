import { Sequelize } from "sequelize";
import connection from "../config/sequelize-config.js"; // Nome da tabela
const Usuario = connection.define("usuario", {
  nome: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true, 
  },
  senha: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

// Sincronizando a tabela com o banco de dados.
// force: false garante que a tabela não seja apagada e recriada se já existir.Usuario.sync({ force: false });

export default Usuario;
