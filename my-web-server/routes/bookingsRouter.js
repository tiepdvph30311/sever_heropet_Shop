const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();


router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Trang hiện tại
        const pageSize = 5; // Số lượng phần tử trên mỗi trang
        const startAt = (page - 1) * pageSize;

        // Lấy danh sách bookings có phân trang
        const snapshot = await db.collection('CTHDBooking')
            .orderBy('thoiGianDatLich', 'desc') // Sắp xếp giảm dần
            .offset(startAt)
            .limit(pageSize)
            .get();

        const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Lấy thông tin Profile từ User → Profile cho mỗi booking
        for (let booking of bookings) {
            if (booking.iduser) {
                const profilesSnapshot = await db.collection('User')
                    .doc(booking.iduser)
                    .collection('Profile')
                    .get();

                if (!profilesSnapshot.empty) {
                    const profileData = profilesSnapshot.docs[0].data();
                    booking.hoten = profileData.hoten || 'Không xác định';
                    booking.sdt = profileData.sdt || 'Không xác định';
                } else {
                    booking.hoten = 'Không xác định';
                    booking.sdt = 'Không xác định';
                }
            } else {
                booking.hoten = 'Không xác định';
                booking.sdt = 'Không xác định';
            }
        }

        // Tổng số lượng bản ghi
        const totalSnapshot = await db.collection('CTHDBooking').get();
        const totalRecords = totalSnapshot.size;
        const totalPages = Math.ceil(totalRecords / pageSize);

        res.render('bookings', {
            bookings,
            currentPage: page,
            totalPages: totalPages,
            hoten: '' // Giá trị mặc định của hoten
        });
    } catch (error) {
        console.error('Lỗi khi tải danh sách bookings:', error);
        res.status(500).send('Lỗi khi tải danh sách bookings');
    }
});

// chi tiết đơn hàng
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
  
      res.render('bookingDetails', {
        booking,
        userProfile,
        serviceDetails
      });
    } catch (error) {
      console.error('Error fetching booking details:', error);
      res.status(500).send('Error fetching booking details');
    }
  });
//   router.get('/details/:idcthdbooking', async (req, res) => {
//     const { idcthdbooking } = req.params;
//     try {
//       const snapshot = await db.collection('CTHDBooking').where('idcthdbooking', '==', idcthdbooking).get();
//       if (snapshot.empty) {
//         return res.status(404).send('Booking not found');
//       }
//       const booking = snapshot.docs[0].data();
  
//       // Fetch user profile information
//       let userProfile = {};
//       if (booking.iduser) {
//         const profilesSnapshot = await db.collection('User')
//           .doc(booking.iduser)
//           .collection('Profile')
//           .get();
  
//         if (!profilesSnapshot.empty) {
//           userProfile = profilesSnapshot.docs[0].data();
//         }
//       }
  
//       // Fetch service details using serviceIds
//       const serviceDetails = [];
//       if (booking.serviceIds && Array.isArray(booking.serviceIds)) {
//         for (const serviceId of booking.serviceIds) {
//           const serviceSnapshot = await db.collection('services').doc(serviceId).get();
//           if (serviceSnapshot.exists) {
//             serviceDetails.push(serviceSnapshot.data());
//           }
//         }
//       }
  
//       res.render('bookingDetail', {
//         booking,
//         userProfile,
//         serviceDetails
//       });
//     } catch (error) {
//       console.error('Error fetching booking details:', error);
//       res.status(500).send('Error fetching booking details');
//     }
//   });
    
router.get('/details/:idcthdbooking', async (req, res) => {
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
  
      // Calculate the total price of all services
      const totalServicePrice = serviceDetails.reduce((total, service) => total + service.gia, 0);
  
      // Calculate the additional fee
      const additionalFee = booking.giaDichVu - totalServicePrice;
  
      res.render('bookingDetail', {
        booking,
        userProfile,
        serviceDetails,
        totalServicePrice,
        additionalFee
      });
    } catch (error) {
      console.error('Error fetching booking details:', error);
      res.status(500).send('Error fetching booking details');
    }
  });
  
router.get('/search', async (req, res) => {
    const { tenKhachHang } = req.query;
    try {
        // Lấy tất cả dữ liệu nếu không có tham số tìm kiếm
        let bookingsSnapshot;
        let isSearch = false;

        if (tenKhachHang && tenKhachHang.trim() !== '') {
            console.log("Đang tìm kiếm khách hàng với tên:", tenKhachHang.trim());
            isSearch = true;

            // Lọc theo tên khách hàng
            bookingsSnapshot = await db.collection('CTHDBooking')
                .where('tenKhachHang', '>=', tenKhachHang.trim())
                .where('tenKhachHang', '<=', tenKhachHang.trim() + '\uf8ff')
                .get();
        } else {
            // Lấy toàn bộ bookings nếu không tìm kiếm
            bookingsSnapshot = await db.collection('CTHDBooking').get();
        }

        const bookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log("Danh sách bookings:", bookings);

        // Hiển thị toàn bộ dữ liệu với điều kiện tìm kiếm hoặc không
        res.render('bookings', {
            bookings,
            currentPage: 1,
            totalPages: 1,
            hoten: tenKhachHang || '', // Giá trị tìm kiếm (nếu có)
            isSearch
        });
    } catch (error) {
        console.error('Lỗi khi tìm kiếm bookings:', error);
        res.status(500).send('Lỗi khi tìm kiếm bookings.');
    }
});







// Sửa booking
router.get('/editBooking/:idcthdbooking', async (req, res) => {
    const { idcthdbooking } = req.params;
    try {
        const snapshot = await db.collection('CTHDBooking').where('idcthdbooking', '==', idcthdbooking).get();
        if (snapshot.empty) {
            return res.status(404).send('Booking không tìm thấy');
        }
        const booking = snapshot.docs[0].data();
        const doccthd = await db.collection('User')
            .doc(booking.iduser)  // Document chứa subcollection ALL
            .collection('Profile')
            .get()

            
        const bookinguid = doccthd.docs[0].data();
        
        console.log(bookinguid);

        res.render('editBooking', { booking }); // Gửi thông tin booking để hiển thị lên form sửa
    } catch (error) {
        console.error("Lỗi khi sửa booking:", error);
        res.status(500).send('Lỗi khi sửa booking');
    }
});

router.post('/editBooking/:idcthdbooking', async (req, res) => {
    const { idcthdbooking } = req.params;
    const { trangThai } = req.body; // Chỉ cho phép sửa trường trạng thái
    try {
        const snapshot = await db.collection('CTHDBooking').where('idcthdbooking', '==', idcthdbooking).get();
        if (snapshot.empty) {
            return res.status(404).send('Booking không tìm thấy');
        }
        const docId = snapshot.docs[0].id;


        // Cập nhật trạng thái
        await db.collection('CTHDBooking').doc(docId).update({
            trangThai // Chỉ cập nhật trường trạng thái
        });

        // Nếu trạng thái mới là "Hoàn thành", thêm thông báo cho admin
        if (trangThai === 'Hoàn thành') {
            const notification = {
                message: `Booking ${idcthdbooking} Đã hoàn thành .`,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            };
            await db.collection('Notifications').add(notification);  // Lưu thông báo vào Firestore
        }

        res.redirect('/bookings'); // Quay lại danh sách booking sau khi sửa
    } catch (error) {
        console.error("Lỗi khi cập nhật booking:", error);
        res.status(500).send('Lỗi khi cập nhật booking');
    }
});

// Xóa booking
router.get('/deleteBooking/:idcthdbooking', async (req, res) => {
    const { idcthdbooking } = req.params;
    try {
        const snapshot = await db.collection('CTHDBooking').where('idcthdbooking', '==', idcthdbooking).get();
        if (snapshot.empty) {
            return res.status(404).send('Booking không tìm thấy');
        }
        const docId = snapshot.docs[0].id;
        await db.collection('CTHDBooking').doc(docId).delete();
        res.redirect('/bookings'); // Quay lại danh sách booking sau khi xóa
    } catch (error) {
        console.error("Lỗi khi xóa booking:", error);
        res.status(500).send('Lỗi khi xóa booking');
    }
});

module.exports = router;
