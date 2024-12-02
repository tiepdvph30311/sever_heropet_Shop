const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const app = express();
app.use(express.urlencoded({ extended: true }));

// Khởi tạo Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Cấu hình EJS và thư mục tĩnh
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public', 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('home'); // Hiển thị trang home.ejs
});

const productRouter = require('./routes/productRoutes'); // Adjust based on your file structure
app.use('/product', productRouter);

// Sử dụng route dịch vụ
const servicesRoutes = require('./routes/servicesRoutes');
app.use('/services', servicesRoutes); 


// Khởi động server
const port = 3000;
app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
