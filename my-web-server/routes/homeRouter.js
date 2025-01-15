const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const moment = require('moment')



// Đường dẫn đến danh sách bookings
router.get('/', async (req, res) => {
  try {

    //nguoi dung
    const snapshot = await db.collection('IDUser')
      .get();

    const bookings = snapshot.docs.map(doc => doc.data());
    let arayUserId = []
    bookings.forEach(doc => {
      arayUserId.push(doc.iduser)
    });

    let mang = []
    await Promise.all(arayUserId.map(userId => {
      return db.collection('User')
        .doc(userId)
        .collection('Profile')
        .get()
        .then(snapshot => {
          if (snapshot.empty) {
            console.log('No documents found for user:', userId);
          } else {
            snapshot.docs.forEach(doc => {
              // console.log(doc.id, '=>', doc.data());
              mang.push(doc.data())
            });
          }
        });
    }))



    const nguoiDungDem = mang.length

    //hoa don
    const revenueQuery2 = await db.collection('CTHDBooking').get();
    const HoaDonTong = revenueQuery2.docs.map(doc => ({ id: doc.id, ...doc.data() }));


    const revenueSnapshot = HoaDonTong.filter(booking => booking.trangThai === 'Hoàn thành');
    let totalOrders = revenueSnapshot.length; // Tổng số đơn

    const totalRevenue = revenueSnapshot.reduce((total, booking) => {
      return total + booking.giaDichVu;
    }, 0);

    // Kết quả




    const tonghddem = HoaDonTong.length
    //dinh vu

    const dv = await db.collection('services').where('hoatDong', '==', true).get();
    const dv2 = dv.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const dvdem = dv2.length
    //hd chx xac nhan
    const HoaDoncxn = HoaDonTong.filter(booking => booking.trangThai === 'Chưa xác nhận');
    const tonghdcxndem = HoaDoncxn.length
    // console.log(HoaDonTong);
    //hd huy

    const HoaDonhuy = HoaDonTong.filter(booking => booking.trangThai === 'Đã hủy');
    const tonghdcxnhuy = HoaDonhuy.length
    //don vi pham
    const HoaDonvp = HoaDonTong.filter(booking => booking.trangThaiHuy === true);
    const tonghdcvp = HoaDonvp.length
    //don vi pham
    const tienViPham = tonghdcvp * 30
    // don nay hoan thanh

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Đặt giờ, phút, giây, mili giây về 0
    const startOfToday = today.getTime() / 1000; // Chuyển đổi sang giây
    const endOfToday = startOfToday + 86400; // Thêm 1 ngày (86400 giây)

    // const HoaDontoday = revenueSnapshot.filter(booking => booking.thoiGianDatLich == timestamp);
    // console.log(HoaDontoday);


    // Lọc các booking có thoiGianDatLich trùng với ngày hôm nay
    const bookingsToday = revenueSnapshot.filter(booking => {
      const bookingDateInSeconds = booking.thoiGianDatLich._seconds;
      return bookingDateInSeconds >= startOfToday && bookingDateInSeconds < endOfToday;
    }).length;

    // console.log(bookingsToday);

    const bookingsTodayTong = HoaDoncxn.filter(booking => {
      const bookingDateInSeconds = booking.thoiGianDatLich._seconds;
      return bookingDateInSeconds >= startOfToday && bookingDateInSeconds < endOfToday;
    }).length;

    // console.log(bookingsTodayTong);
    

    // Render và truyền dữ liệu vào EJS
    res.render('home', {
      nguoiDungDem,
      totalRevenue,
      totalOrders,
      tonghddem,
      dvdem,
      tonghdcxndem,
      tonghdcxnhuy,
      tonghdcvp,
      tienViPham,
      bookingsToday,
      bookingsTodayTong
    });
  } catch (error) {
    console.error("Lỗi khi tải danh sách Hóa Đơn:", error);
    res.status(500).send('Lỗi khi tải danh sách Hóa Đơn');
  }
});





module.exports = router;
