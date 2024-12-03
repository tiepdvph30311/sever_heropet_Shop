const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Đường dẫn đến danh sách bookings
router.get('/', async (req, res) => {
    try {
      const snapshot = await db.collection('bookings').get();
      const bookings = snapshot.docs.map(doc => doc.data());
  
      // Render dữ liệu vào template (có thể dùng EJS, Pug, hoặc gửi dưới dạng JSON)
      res.render('bookings', { bookings });
    } catch (error) {
      console.error("Lỗi khi tải danh sách bookings:", error);  // Log lỗi chi tiết
      res.status(500).send('Lỗi khi tải danh sách bookings');
    }
  });
  router.post('/addBooking', async (req, res) => {
    const { canNang, idBooking, idUser, loaiThuCung, tenDichVu, tenThuCung, thoiGianDatLich, trangThai } = req.body;
    try {
      await db.collection('bookings').add({
        canNang,
        idBooking,
        idUser,
        loaiThuCung,
        tenDichVu,
        tenThuCung,
        thoiGianDatLich: admin.firestore.Timestamp.fromDate(new Date(thoiGianDatLich)),
        trangThai
      });
      res.redirect('/bookings'); // Quay lại danh sách booking sau khi thêm
    } catch (error) {
      console.error("Lỗi khi thêm booking:", error);
      res.status(500).send('Lỗi khi thêm booking');
    }
  });
  
  // Sửa booking
  router.get('/editBooking/:idBooking', async (req, res) => {
    const { idBooking } = req.params;
    try {
      const snapshot = await db.collection('bookings').where('idBooking', '==', idBooking).get();
      if (snapshot.empty) {
        return res.status(404).send('Booking không tìm thấy');
      }
      const booking = snapshot.docs[0].data();
      res.render('editBooking', { booking }); // Gửi thông tin booking để hiển thị lên form sửa
    } catch (error) {
      console.error("Lỗi khi sửa booking:", error);
      res.status(500).send('Lỗi khi sửa booking');
    }
  });
  
  router.post('/editBooking/:idBooking', async (req, res) => {
    const { idBooking } = req.params;
    const { canNang, idUser, loaiThuCung, tenDichVu, tenThuCung, thoiGianDatLich, trangThai } = req.body;
    try {
      const snapshot = await db.collection('bookings').where('idBooking', '==', idBooking).get();
      if (snapshot.empty) {
        return res.status(404).send('Booking không tìm thấy');
      }
      const docId = snapshot.docs[0].id;
      await db.collection('bookings').doc(docId).update({
        canNang,
        idUser,
        loaiThuCung,
        tenDichVu,
        tenThuCung,
        thoiGianDatLich: admin.firestore.Timestamp.fromDate(new Date(thoiGianDatLich)),
        trangThai
      });
      res.redirect('/bookings'); // Quay lại danh sách booking sau khi sửa
    } catch (error) {
      console.error("Lỗi khi cập nhật booking:", error);
      res.status(500).send('Lỗi khi cập nhật booking');
    }
  });
  
  // Xóa booking
  router.get('/deleteBooking/:idBooking', async (req, res) => {
    const { idBooking } = req.params;
    try {
      const snapshot = await db.collection('bookings').where('idBooking', '==', idBooking).get();
      if (snapshot.empty) {
        return res.status(404).send('Booking không tìm thấy');
      }
      const docId = snapshot.docs[0].id;
      await db.collection('bookings').doc(docId).delete();
      res.redirect('/bookings'); // Quay lại danh sách booking sau khi xóa
    } catch (error) {
      console.error("Lỗi khi xóa booking:", error);
      res.status(500).send('Lỗi khi xóa booking');
    }
  });
  

module.exports = router;
