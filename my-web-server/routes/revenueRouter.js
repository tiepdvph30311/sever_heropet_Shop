const express = require('express');
const admin = require('firebase-admin');
const moment = require('moment');
const router = express.Router();
const db = admin.firestore(); 


// Đảm bảo Firestore đã được cấu hình
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://<your-database-name>.firebaseio.com"
// });

// Endpoint để thống kê theo tháng
router.get('/monthly', async (req, res) => {
  try {
    const { year } = req.query; // Nhận năm từ query (mặc định là năm hiện tại)
    const selectedYear = year ? parseInt(year, 10) : new Date().getFullYear();

    // Lấy tất cả đơn "Hoàn thành" trong năm đã chọn
    const startOfYear = moment(`${selectedYear}-01-01`, 'YYYY-MM-DD').startOf('year').toDate();
    const endOfYear = moment(`${selectedYear}-12-31`, 'YYYY-MM-DD').endOf('year').toDate();

    const revenueQuery = db.collection('CTHDBooking')
      .where('trangThai', '==', 'Hoàn thành')
      .where('thoiGianDatLich', '>=', admin.firestore.Timestamp.fromDate(startOfYear))
      .where('thoiGianDatLich', '<=', admin.firestore.Timestamp.fromDate(endOfYear));

    const revenueSnapshot = await revenueQuery.get();

    // Tạo dữ liệu doanh thu và số lượng theo từng tháng
    const monthlyData = Array(12).fill(null).map(() => ({ totalOrders: 0, totalRevenue: 0 }));

    revenueSnapshot.forEach(doc => {
      const data = doc.data();
      const orderDate = data.thoiGianDatLich.toDate();
      const month = orderDate.getMonth(); // Lấy tháng (0-11)
      const servicePrice = data.giaDichVu || 0;

      monthlyData[month].totalOrders += 1; // Tăng số lượng đơn
      monthlyData[month].totalRevenue += servicePrice; // Cộng doanh thu
    });

    // Truyền dữ liệu cho giao diện
    res.render('doanhthu-theothang', {
      selectedYear,
      monthlyData
    });

  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu theo tháng:', error);
    res.status(500).send('Lỗi khi lấy dữ liệu theo tháng');
  }
});

module.exports = router;
