const express = require('express');
const router = express.Router();
const admin = require('firebase-admin'); 
const db = admin.firestore();
const moment = require('moment');

// Route thống kê doanh thu
// router.get('/', async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;

//     // Chuyển startDate và endDate thành đối tượng Date
//     const start = startDate ? moment(startDate, 'YYYY-MM-DD').startOf('day').toDate() : null;
//     const end = endDate ? moment(endDate, 'YYYY-MM-DD').endOf('day').toDate() : null;

//     // Tạo query Firestore để lọc theo thời gian và trạng thái "Đã xác nhận"
//     let query = db.collection('CTHDBooking').where('trangThai', '==', 'Hoàn thành'); // Thêm điều kiện lọc theo trạng thái

//     if (start && end) {
//       query = query.where('thoiGianDatLich', '>=', admin.firestore.Timestamp.fromDate(start))
//                    .where('thoiGianDatLich', '<=', admin.firestore.Timestamp.fromDate(end));
//     }



//     const snapshot = await query.get();
//     const serviceUsage = {};
//     let totalRevenue = 0;

//     snapshot.forEach(doc => {
//       const data = doc.data();
//       const serviceName = data.tenDichVu;
//       const servicePrice = data.giaDichVu || 0;

//       // Cộng dồn số lượng và doanh thu của dịch vụ
//       if (serviceUsage[serviceName]) {
//         serviceUsage[serviceName].quantity += 1;
//         serviceUsage[serviceName].totalRevenue += servicePrice;
//       } else {
//         serviceUsage[serviceName] = {
//           quantity: 1,
//           totalRevenue: servicePrice
//         };
//       }
//       totalRevenue += servicePrice;
//     });

//     // Sắp xếp dịch vụ theo số lượng sử dụng (từ cao đến thấp)
//     const sortedServiceUsage = Object.keys(serviceUsage)
//       .map(service => ({
//         serviceName: service,
//         quantity: serviceUsage[service].quantity,
//         totalRevenue: serviceUsage[service].totalRevenue
//       }))
//       .sort((a, b) => b.quantity - a.quantity);

//     // Render thống kê doanh thu
//     res.render('doanhthu', {
//       startDate: startDate || '',
//       endDate: endDate || '',
//       serviceUsage: sortedServiceUsage,
//       totalRevenue
//     });

//   } catch (error) {
//     console.error('Lỗi khi lấy thống kê:', error);
//     res.status(500).send('Lỗi khi lấy thống kê');
//   }
// });

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
    const serviceUsage = {};
    let totalRevenue = 0;

    revenueSnapshot.forEach(doc => {
      const data = doc.data();
      const serviceName = data.tenDichVu || 'Dịch vụ không xác định';
      const servicePrice = data.giaDichVu || 0;

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

    const sortedServiceUsage = Object.keys(serviceUsage)
      .map(service => ({
        serviceName: service,
        quantity: serviceUsage[service].quantity,
        totalRevenue: serviceUsage[service].totalRevenue
      }))
      .sort((a, b) => b.quantity - a.quantity);

    // Query Firestore cho top sản phẩm
    const topServicesSnapshot = await db.collection('CTHDBooking').where('trangThai', '==', 'Hoàn thành').get();
    const topServiceUsage = {};

    topServicesSnapshot.forEach(doc => {
      const data = doc.data();
      const serviceIds = data.serviceId || []; // Mảng chứa ID dịch vụ

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

    // Truyền cả hai dữ liệu vào giao diện
    res.render('doanhthu', {
      startDate: startDate || '',
      endDate: endDate || '',
      serviceUsage: sortedServiceUsage,
      totalRevenue,
      topServices
    });

  } catch (error) {
    console.error('Lỗi khi lấy thống kê:', error);
    res.status(500).send('Lỗi khi lấy thống kê');
  }
});

module.exports = router;
