// models/associations.js
import Usuario from "./usuario.js"; 
import Produto from "./produtos.js"; 

// Um usuário tem muitos produtos (1:N)
Usuario.hasMany(Produto, {
    // CHAVE ESTRANGEIRA CORRIGIDA
    foreignKey: 'usuario_id_fk', 
    as: 'produtosCriados' 
});

// Um produto pertence a um usuário
Produto.belongsTo(Usuario, {
    // CHAVE ESTRANGEIRA CORRIGIDA
    foreignKey: 'usuario_id_fk', 
    as: 'criador' 
});

export { Usuario, Produto };