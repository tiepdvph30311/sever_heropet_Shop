const admin = require('firebase-admin');

// Cấu hình Firebase Admin SDK
const serviceAccount = require('./path/to/your/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-database-name.firebaseio.com"
});

const db = admin.database();
module.exports = db;
