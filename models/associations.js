// models/associations.js
import Usuario from "./usuario.js"; // Seus modelos importados
import Produto from "./produtos.js"; // Seus modelos importados

// Um usuário tem muitos produtos (1:N)
// O Produto terá uma coluna chamada 'usuarioId' por padrão.
Usuario.hasMany(Produto, {
    foreignKey: 'usuarioId', // Define o nome da coluna no modelo Produto
    as: 'produtosCriados'    // Alias para incluir o usuário
});

// Um produto pertence a um usuário
Produto.belongsTo(Usuario, {
    foreignKey: 'usuarioId', // Deve ser o mesmo nome da coluna acima
    as: 'criador'           // Alias para incluir o criador
});

// Sincronize novamente (se estiver em um arquivo de inicialização, caso contrário o Sequelize cuida ao iniciar a aplicação)
// Se precisar rodar isso, certifique-se que o banco vai criar a coluna 'usuarioId' em 'produtos'.
// connection.sync({ alter: true }); // Use 'alter: true' para adicionar colunas sem perder dados

export { Usuario, Produto }; // Exporte se este for seu ponto principal de modelos