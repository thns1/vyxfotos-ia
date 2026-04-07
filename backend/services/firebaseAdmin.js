const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let db = null;

// Tenta iniciar se o usuário tiver colocado o arquivo json do firebase
const serviceAccountPath = path.join(__dirname, 'firebase-admin-key.json');

try {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://vyxfotos-default-rtdb.firebaseio.com/"
    });
    db = admin.database();
    console.log('✅ [🔥 Firebase] Realtime Database Conectado!');
  } else {
    console.warn('⚠️ [🔥 Firebase] Arquivo "firebase-admin-key.json" não encontrado. O Banco de Dados de pedidos está rodando em modo OFFLINE até que a configuração seja inserida.');
  }

} catch (error) {
  console.error('❌ [🔥 Firebase] Erro interno ao tentar conectar o servidor ao banco:', error.message);
}

module.exports = {
  admin,
  db
};
