import Produto from "../models/produtos.js";
import Usuario from "../models/usuario.js";
import Ingrediente from "../models/ingredientes.js"; 
import ProdutoIngrediente from "../models/produtoIngrediente.js"; 

const defineAssociations = () => {

    Usuario.hasMany(Produto, { foreignKey: "usuario_id" });
    Produto.belongsTo(Usuario, { foreignKey: "usuario_id" });

    Produto.belongsToMany(Ingrediente, {
        through: ProdutoIngrediente, 
        foreignKey: 'produtoId',
        as: 'ingredientes'
    });

    Ingrediente.belongsToMany(Produto, {
        through: ProdutoIngrediente, 
        foreignKey: 'ingredienteId',
        as: 'produtos'
    });
};

export default defineAssociations;