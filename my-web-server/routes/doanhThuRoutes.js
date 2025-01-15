const express = require('express');
const router = express.Router();
const admin = require('firebase-admin'); 
const db = admin.firestore();
const moment = require('moment');

router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Lấy ngày đầu tiên của tháng hiện tại và ngày hiện tại
    const now = moment();
    const defaultStart = now.clone().startOf('month').toDate(); // Ngày 1 của tháng hiện tại
    const defaultEnd = now.clone().endOf('day').toDate(); // Ngày hiện tại

    // Nếu không có `startDate` hoặc `endDate`, sử dụng mặc định
    const start = startDate ? moment(startDate, 'YYYY-MM-DD').startOf('day').toDate() : defaultStart;
    const end = endDate ? moment(endDate, 'YYYY-MM-DD').endOf('day').toDate() : defaultEnd;

    // Query Firestore cho thống kê doanh thu
    let revenueQuery = db.collection('CTHDBooking').where('trangThai', '==', 'Hoàn thành');
    revenueQuery = revenueQuery.where('thoiGianDatLich', '>=', admin.firestore.Timestamp.fromDate(start))
                               .where('thoiGianDatLich', '<=', admin.firestore.Timestamp.fromDate(end));

    const revenueSnapshot = await revenueQuery.get();
    let totalOrders = 0; // Tổng số đơn
    let totalRevenue = 0; // Tổng doanh thu

    revenueSnapshot.forEach(doc => {
      const data = doc.data();
      const servicePrice = data.giaDichVu || 0;

      totalOrders += 1; // Đếm số đơn
      totalRevenue += servicePrice; // Tính tổng doanh thu
    });

    // Phần xử lý "Top Dịch Vụ"
    let topServicesQuery = db.collection('CTHDBooking').where('trangThai', '==', 'Hoàn thành');
    topServicesQuery = topServicesQuery.where('thoiGianDatLich', '>=', admin.firestore.Timestamp.fromDate(start))
                                       .where('thoiGianDatLich', '<=', admin.firestore.Timestamp.fromDate(end));

    const topServicesSnapshot = await topServicesQuery.get();
    const topServiceUsage = {};

    topServicesSnapshot.forEach(doc => {
      const data = doc.data();
      const serviceIds = data.serviceIds || []; // Mảng chứa ID dịch vụ

      serviceIds.forEach(serviceId => {
        if (!topServiceUsage[serviceId]) {
          topServiceUsage[serviceId] = 0;
        }
        topServiceUsage[serviceId]++;
      });
    });

    const sortedTopServices = Object.entries(topServiceUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const topServices = [];
    for (const [serviceId, quantity] of sortedTopServices) {
      const serviceDoc = await db.collection('services').doc(serviceId).get();
      if (serviceDoc.exists) {
        const serviceData = serviceDoc.data();
        topServices.push({
          serviceId,
          serviceName: serviceData.tenDichVu || 'Không xác định',
          quantity,
        });
      }
    }

    // Truyền cả dữ liệu vào giao diện
    res.render('doanhthu', {
      startDate: startDate || moment(defaultStart).format('YYYY-MM-DD'),
      endDate: endDate || moment(defaultEnd).format('YYYY-MM-DD'),
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
