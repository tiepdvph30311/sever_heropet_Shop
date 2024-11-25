const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const app = express();

// Khởi tạo Firebase Admin SDK
var serviceAccount = require('./serviceAccountKey.json');  // Đảm bảo đường dẫn đúng

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://foodfullchucnangcodedoan-default-rtdb.firebaseio.com",  // Không cần nếu bạn dùng Firestore
});

const db = admin.firestore();  // Kết nối Firestore

// Cấu hình EJS để render HTML
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Cấu hình thư mục tĩnh (CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Route lấy sản phẩm từ Firestore và hiển thị
app.get("/", (req, res) => {
  db.collection('SanPham').get()  // Truy vấn tất cả dữ liệu trong collection "SanPham"
    .then(snapshot => {
      const products = [];
      snapshot.forEach(doc => {
        products.push(doc.data());  // Thêm từng sản phẩm vào mảng
      });
      // Render trang index.ejs và truyền dữ liệu sản phẩm
      res.render("index", { products });
    })
    .catch(error => {
      console.error("Lỗi khi lấy dữ liệu:", error);
      res.status(500).send("Có lỗi xảy ra khi lấy dữ liệu.");
    });
});

// Khởi động server
const port = 3000;
app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
