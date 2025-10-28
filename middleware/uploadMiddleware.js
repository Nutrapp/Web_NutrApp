    import multer from 'multer';
import path from 'path';

// O Multer SALVA DENTRO da pasta public/uploads, 
// que é o local acessível via navegador.
const UPLOAD_FOLDER = 'public/uploads';

// --- 1. Configuração de Armazenamento (Storage) ---
const storage = multer.diskStorage({
    // Define o destino do arquivo (a pasta que receberá o upload)
    destination: (req, file, cb) => {
        // O primeiro parâmetro é o erro (null se não houver)
        cb(null, UPLOAD_FOLDER); 
    },
    
    // Define o nome do arquivo que será salvo
    filename: (req, file, cb) => {
        // Garante que o nome do arquivo seja único para evitar sobrescrever
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Usa o nome do campo ('imagemProduto') + sufixo único + extensão original
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// --- 2. Configuração Principal do Multer ---
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // Limite de 5 Megabytes (opcional, mas recomendado)
    },
    fileFilter: (req, file, cb) => {
        // Função para garantir que apenas imagens sejam carregadas
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true); // Aceita o arquivo
        } else {
            // Rejeita o arquivo e passa um erro
            cb(new Error('Apenas arquivos de imagem (jpeg, jpg, png, gif) são permitidos.')); 
        }
    }
});

// Exporta a instância configurada
export default upload;
