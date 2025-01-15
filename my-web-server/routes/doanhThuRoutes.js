const express = require('express');
const router = express.Router();
const admin = require('firebase-admin'); 
const db = admin.firestore();
const moment = require('moment');

// Updated server-side logic
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const now = moment();
    const defaultStart = now.clone().startOf('month').toDate();
    const defaultEnd = now.clone().endOf('day').toDate();

    const start = startDate ? moment(startDate, 'YYYY-MM-DD').startOf('day').toDate() : defaultStart;
    const end = endDate ? moment(endDate, 'YYYY-MM-DD').endOf('day').toDate() : defaultEnd;

    // Query for "Hoàn thành" orders
    let revenueQuery = db.collection('CTHDBooking').where('trangThai', '==', 'Hoàn thành');
    revenueQuery = revenueQuery.where('thoiGianDatLich', '>=', admin.firestore.Timestamp.fromDate(start))
                               .where('thoiGianDatLich', '<=', admin.firestore.Timestamp.fromDate(end));

    const revenueSnapshot = await revenueQuery.get();
    let totalOrders = 0;
    let totalRevenue = 0;

    revenueSnapshot.forEach(doc => {
      const data = doc.data();
      const servicePrice = data.giaDichVu || 0;
      totalOrders += 1;
      totalRevenue += servicePrice;
    });

    // Query for "Đã hủy" orders
    let cancelQuery = db.collection('CTHDBooking').where('trangThai', '==', 'Đã hủy');
    cancelQuery = cancelQuery.where('thoiGianDatLich', '>=', admin.firestore.Timestamp.fromDate(start))
                             .where('thoiGianDatLich', '<=', admin.firestore.Timestamp.fromDate(end));

    const cancelSnapshot = await cancelQuery.get();
    let totalCanceledOrders = 0;
    let totalCanceledAmount = 0;

    cancelSnapshot.forEach(doc => {
      const data = doc.data();
      const cancelAmount = data.tienHuy || 0;
      totalCanceledOrders += 1;
      totalCanceledAmount += cancelAmount;
    });

    // Top Services Query (existing functionality)
    let topServicesQuery = db.collection('CTHDBooking').where('trangThai', '==', 'Hoàn thành');
    topServicesQuery = topServicesQuery.where('thoiGianDatLich', '>=', admin.firestore.Timestamp.fromDate(start))
                                       .where('thoiGianDatLich', '<=', admin.firestore.Timestamp.fromDate(end));

    const topServicesSnapshot = await topServicesQuery.get();
    const topServiceUsage = {};

    topServicesSnapshot.forEach(doc => {
      const data = doc.data();
      const serviceIds = data.serviceIds || [];

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

    res.render('doanhthu', {
      startDate: startDate || moment(defaultStart).format('YYYY-MM-DD'),
      endDate: endDate || moment(defaultEnd).format('YYYY-MM-DD'),
      totalOrders,
      totalRevenue,
      totalCanceledOrders, // Tổng đơn hàng đã hủy
      totalCanceledAmount, // Tổng tiền hủy
      topServices,
    });

  } catch (error) {
    console.error('Lỗi khi lấy thống kê:', error);
    res.status(500).send('Lỗi khi lấy thống kê');
  }
});


module.exports = router;
