const express = require('express');
const router = express.Router();
const admin = require('firebase-admin'); 
const db = admin.firestore();
const moment = require('moment');


router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Chuyển đổi thời gian
    const start = startDate ? moment(startDate, 'YYYY-MM-DD').startOf('day').toDate() : null;
    const end = endDate ? moment(endDate, 'YYYY-MM-DD').endOf('day').toDate() : null;

    // Query Firestore cho thống kê doanh thu
    let revenueQuery = db.collection('CTHDBooking').where('trangThai', '==', 'Hoàn thành');
    if (start && end) {
      revenueQuery = revenueQuery.where('thoiGianDatLich', '>=', admin.firestore.Timestamp.fromDate(start))
                                 .where('thoiGianDatLich', '<=', admin.firestore.Timestamp.fromDate(end));
    }

    const revenueSnapshot = await revenueQuery.get();
    let totalOrders = 0; // Tổng số đơn
    let totalRevenue = 0; // Tổng doanh thu

    revenueSnapshot.forEach(doc => {
      const data = doc.data();
      const servicePrice = data.giaDichVu || 0;

      totalOrders += 1; // Đếm số đơn
      totalRevenue += servicePrice; // Tính tổng doanh thu
    });

    // Phần xử lý "Top Sản Phẩm"
    const topServicesSnapshot = await db.collection('CTHDBooking').where('trangThai', '==', 'Hoàn thành').get();
    const topServiceUsage = {};

    topServicesSnapshot.forEach(doc => {
      const data = doc.data();
      const serviceIds = data.serviceIds || []; // Mảng chứa ID dịch vụ

      serviceIds.forEach(serviceIds => {
        if (!topServiceUsage[serviceIds]) {
          topServiceUsage[serviceIds] = 0;
        }
        topServiceUsage[serviceIds]++;
      });
    });

    const sortedTopServices = Object.entries(topServiceUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const topServices = [];
    for (const [serviceIds, quantity] of sortedTopServices) {
      const serviceDoc = await db.collection('services').doc(serviceIds).get();
      if (serviceDoc.exists) {
        const serviceData = serviceDoc.data();
        topServices.push({
          serviceIds,
          serviceName: serviceData.tenDichVu || 'Không xác định',
          quantity,
        });
      }
    }

    // Truyền cả dữ liệu vào giao diện
    res.render('doanhthu', {
      startDate: startDate || '',
      endDate: endDate || '',
      totalOrders, // Tổng số đơn
      totalRevenue, // Tổng doanh thu
      topServices, // Dữ liệu top sản phẩm
    });

  } catch (error) {
    console.error('Lỗi khi lấy thống kê:', error);
    res.status(500).send('Lỗi khi lấy thống kê');
  }
});


module.exports = router;
