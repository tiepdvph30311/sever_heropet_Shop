const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const nodemailer = require('nodemailer');
const messaging = admin.messaging();

// Cấu hình SMTP


  
  router.get('/', async (req, res) => {
    try {
        const { fromDate, toDate, phoneNumber } = req.query; // Get the date range from the query parameters
        const page = parseInt(req.query.page) || 1; // Trang hiện tại
        const pageSize = 20; // Số lượng phần tử trên mỗi trang
        const startAt = (page - 1) * pageSize;
  
        // Lọc theo ngày nếu có
        let query = db.collection('CTHDBooking')
                      .orderBy('thoiGianDatLich', 'desc') // Sắp xếp giảm dần theo thời gian
                      .where('trangThai', 'in', ['Đã hủy']); // Chỉ lấy đơn có trạng thái phù hợp
  
        if (fromDate && toDate) {
            query = query.where('thoiGianDatLich', '>=', new Date(fromDate))
                         .where('thoiGianDatLich', '<=', new Date(toDate));
        }
  
        // Fetch the bookings with pagination
        const snapshot = await query.offset(startAt).limit(pageSize).get();
  
        let bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
        // Nếu có sdtNguoiDung, lọc thêm
        if (phoneNumber) {
            bookings = bookings.filter(booking => booking.sdtNguoiDung === phoneNumber);
        }
  
        // Fetch thông tin người dùng cho tất cả bookings
        const userIds = bookings.map(booking => booking.iduser).filter(id => id);
        const uniqueUserIds = [...new Set(userIds)]; // Loại bỏ trùng lặp
  
        const userProfilesSnapshot = await Promise.all(
            uniqueUserIds.map(iduser =>
                db.collection('User').doc(iduser).collection('Profile').get()
            )
        );
  
        // Tạo một Map để lưu thông tin người dùng
        const userProfiles = {};
        userProfilesSnapshot.forEach((snapshot, index) => {
            if (!snapshot.empty) {
                const profileData = snapshot.docs[0].data();
                userProfiles[uniqueUserIds[index]] = {
                    hoten: profileData.hoten || 'Không xác định',
                    sdt: profileData.sdt || 'Không xác định'
                };
            }
        });
  
        // Gán thông tin người dùng vào từng booking
        bookings = bookings.map(booking => ({
            ...booking,
            hoten: userProfiles[booking.iduser]?.hoten || 'Không xác định',
            sdt: userProfiles[booking.iduser]?.sdt || 'Không xác định'
        }));
  
        // Lấy tổng số bản ghi cho phân trang
        const totalSnapshot = await db.collection('CTHDBooking')
                                       .where('trangThai', 'in', ['Chưa xác nhận', 'Đã xác nhận'])
                                       .get();
        const totalRecords = totalSnapshot.size;
        const totalPages = Math.ceil(totalRecords / pageSize);
  
        res.render('bookingshuy', {
            bookings,
            currentPage: page,
            totalPages: totalPages,
            fromDate: fromDate || '', // Truyền từ ngày vào template
            toDate: toDate || '',     // Truyền đến ngày vào template
            phoneNumber
        });
    } catch (error) {
        console.error('Error loading bookings:', error);
        res.status(500).send('Error loading bookings');
    }
  });
  
router.get('/:idcthdbooking', async (req, res) => {
    const { idcthdbooking } = req.params;
    try {
      const snapshot = await db.collection('CTHDBooking').where('idcthdbooking', '==', idcthdbooking).get();
      if (snapshot.empty) {
        return res.status(404).send('Booking not found');
      }
      const booking = snapshot.docs[0].data();
  
      // Fetch user profile information
      let userProfile = {};
      if (booking.iduser) {
        const profilesSnapshot = await db.collection('User')
          .doc(booking.iduser)
          .collection('Profile')
          .get();
  
        if (!profilesSnapshot.empty) {
          userProfile = profilesSnapshot.docs[0].data();
        }
      }
  
      // Fetch service details using serviceIds
      const serviceDetails = [];
      if (booking.serviceIds && Array.isArray(booking.serviceIds)) {
        for (const serviceId of booking.serviceIds) {
          const serviceSnapshot = await db.collection('services').doc(serviceId).get();
          if (serviceSnapshot.exists) {
            serviceDetails.push(serviceSnapshot.data());
          }
        }
      }
  
      res.render('bookingDetail', {
        booking,
        userProfile,
        serviceDetails
      });
    } catch (error) {
      console.error('Error fetching booking details:', error);
      res.status(500).send('Error fetching booking details');
    }
  });



  router.get('/hoantien', async (req, res) => {
    try {
        const snapshot = await db.collection('CTHDBooking').get();

        if (snapshot.empty) {
            return res.render('hoantien', { bookings: [] });
        }

        const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const processedBookings = bookings.map(booking => ({
            ...booking,
            action: booking.trangThaiHuy ? 'Đã hoàn tiền' : '<a href="/hoantien/' + booking.id + '" class="btn btn-primary">Hoàn tiền</a>'
        }));

        res.render('hoantien', { bookings: processedBookings });
    } catch (error) {
        console.error('Error fetching bookings for refund:', error);
        res.status(500).send('Error fetching bookings for refund');
    }
});

// Hiển thị trang cập nhật trạng thái hoàn tiền
router.get('/hoantien/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const doc = await db.collection('CTHDBooking').doc(id).get();
        if (!doc.exists) {
            return res.status(404).send('Booking not found');
        }

        const booking = { id: doc.id, ...doc.data() };
        res.render('hoantien', { booking });
    } catch (error) {
        console.error('Error loading refund page:', error);
        res.status(500).send('Error loading refund page');
    }
});

// Cập nhật trạng thái hoàn tiền
router.post('/hoantien/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.collection('CTHDBooking').doc(id).update({ trangThaiHuy: true });
        res.redirect('/hoantien'); // Quay lại danh sách sau khi cập nhật
    } catch (error) {
        console.error('Error updating refund status:', error);
        res.status(500).send('Error updating refund status');
    }
});


module.exports = router;
