const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

router.get('/', async (req, res) => {
    try {
      // Lấy danh sách booking có phân trang
      const snapshot = await db.collection('User')
      .get()
                             
  
      const bookings = snapshot.docs.map(doc => doc.data());
  
      res.render('nguoidung', {
        bookings
      });
    } catch (error) {
      console.error("Lỗi khi tải danh sách bookings:", error);
      res.status(500).send('Lỗi khi tải danh sách bookings');
    }
  });
  
  router.get('/add', async (req, res) => {
    try {
      const loaiProductsSnapshot = await db.collection('LoaiProduct').get();
      const loaiProducts = loaiProductsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      res.render('add', { loaiProducts });
    } catch (error) {
      console.error('Lỗi khi lấy loại sản phẩm:', error);
      res.status(500).send('Có lỗi xảy ra khi lấy loại sản phẩm.');
    }
  });