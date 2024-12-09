const express = require('express');
const router = express.Router();
const admin = require('firebase-admin'); 
const db = admin.firestore();
const moment = require('moment');

// Route thống kê doanh thu
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Chuyển startDate và endDate thành đối tượng Date
    const start = startDate ? moment(startDate, 'YYYY-MM-DD').startOf('day').toDate() : null;
    const end = endDate ? moment(endDate, 'YYYY-MM-DD').endOf('day').toDate() : null;

    // Tạo query Firestore để lọc theo thời gian và trạng thái "Đã xác nhận"
    let query = db.collection('CTHDBooking').where('trangThai', '==', 'Đã xác nhận'); // Thêm điều kiện lọc theo trạng thái

    if (start && end) {
      query = query.where('thoiGianDatLich', '>=', admin.firestore.Timestamp.fromDate(start))
                   .where('thoiGianDatLich', '<=', admin.firestore.Timestamp.fromDate(end));
    }

    const snapshot = await query.get();
    const serviceUsage = {};
    let totalRevenue = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      const serviceName = data.tenDichVu;
      const servicePrice = data.giaDichVu || 0;

      // Cộng dồn số lượng và doanh thu của dịch vụ
      if (serviceUsage[serviceName]) {
        serviceUsage[serviceName].quantity += 1;
        serviceUsage[serviceName].totalRevenue += servicePrice;
      } else {
        serviceUsage[serviceName] = {
          quantity: 1,
          totalRevenue: servicePrice
        };
      }
      totalRevenue += servicePrice;
    });

    // Sắp xếp dịch vụ theo số lượng sử dụng (từ cao đến thấp)
    const sortedServiceUsage = Object.keys(serviceUsage)
      .map(service => ({
        serviceName: service,
        quantity: serviceUsage[service].quantity,
        totalRevenue: serviceUsage[service].totalRevenue
      }))
      .sort((a, b) => b.quantity - a.quantity);

    // Render thống kê doanh thu
    res.render('doanhthu', {
      startDate: startDate || '',
      endDate: endDate || '',
      serviceUsage: sortedServiceUsage,
      totalRevenue
    });

  } catch (error) {
    console.error('Lỗi khi lấy thống kê:', error);
    res.status(500).send('Lỗi khi lấy thống kê');
  }
});

module.exports = router;
