const express = require('express');
const admin = require('firebase-admin');
const moment = require('moment');
const router = express.Router();
const db = admin.firestore(); 



// Endpoint để thống kê theo tháng
// Endpoint để thống kê cả đơn "Hoàn thành" và "Hủy" theo tháng
router.get('/monthly', async (req, res) => {
  try {
    const { year } = req.query; // Nhận năm từ query (mặc định là năm hiện tại)
    const selectedYear = year ? parseInt(year, 10) : new Date().getFullYear();

    // Xác định thời gian bắt đầu và kết thúc năm
    const startOfYear = moment(`${selectedYear}-01-01`, 'YYYY-MM-DD').startOf('year').toDate();
    const endOfYear = moment(`${selectedYear}-12-31`, 'YYYY-MM-DD').endOf('year').toDate();

    // Truy vấn đơn "Hoàn thành" trong năm
    const completedQuery = db.collection('CTHDBooking')
      .where('trangThai', '==', 'Hoàn thành')
      .where('thoiGianDatLich', '>=', admin.firestore.Timestamp.fromDate(startOfYear))
      .where('thoiGianDatLich', '<=', admin.firestore.Timestamp.fromDate(endOfYear));

    // Truy vấn đơn "Hủy" trong năm
    const cancelledQuery = db.collection('CTHDBooking')
      .where('trangThai', '==', 'Đã hủy')
      .where('thoiGianDatLich', '>=', admin.firestore.Timestamp.fromDate(startOfYear))
      .where('thoiGianDatLich', '<=', admin.firestore.Timestamp.fromDate(endOfYear));

    const [completedSnapshot, cancelledSnapshot] = await Promise.all([
      completedQuery.get(),
      cancelledQuery.get(),
    ]);

    // Tạo dữ liệu thống kê cho cả hai trạng thái theo tháng
    const monthlyData = Array(12).fill(null).map(() => ({
      completedOrders: 0, // Đơn hoàn thành
      cancelledOrders: 0, // Đơn hủy
      totalRevenue: 0,    // Doanh thu từ đơn hoàn thành
    }));

    // Xử lý đơn "Hoàn thành"
    completedSnapshot.forEach(doc => {
      const data = doc.data();
      const orderDate = data.thoiGianDatLich.toDate();
      const month = orderDate.getMonth(); // Lấy tháng (0-11)
      const servicePrice = data.giaDichVu || 0;

      monthlyData[month].completedOrders += 1; // Tăng số lượng đơn hoàn thành
      monthlyData[month].totalRevenue += servicePrice; // Cộng doanh thu
    });

    // Xử lý đơn "Hủy"
    cancelledSnapshot.forEach(doc => {
      const data = doc.data();
      const orderDate = data.thoiGianDatLich.toDate();
      const month = orderDate.getMonth(); // Lấy tháng (0-11)

      monthlyData[month].cancelledOrders += 1; // Tăng số lượng đơn bị hủy
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
