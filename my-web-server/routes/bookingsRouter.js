const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const nodemailer = require('nodemailer');
const messaging = admin.messaging();

// Cấu hình SMTP
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'tiepdv220601@gmail.com', // Email của bạn
        pass: 'mgtm mrkf jpyf hepu'  // Mật khẩu ứng dụng
    }
});


router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Trang hiện tại
        const pageSize = 10; // Số lượng phần tử trên mỗi trang
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
  
router.get('/searchbooking', async (req, res) => {
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
        
        // console.log(bookinguid);

        res.render('editBooking', { booking, errorMessage: null }); // Gửi thông tin booking để hiển thị lên form sửa
    } catch (error) {
        console.error("Lỗi khi sửa booking:", error);
        res.status(500).send('Lỗi khi sửa booking');
    }
});

// router.post('/editBooking/:idcthdbooking', async (req, res) => {
//     const { idcthdbooking } = req.params;
//     const { trangThai } = req.body; // Chỉ cho phép sửa trường trạng thái
//     try {
//         const snapshot = await db.collection('CTHDBooking').where('idcthdbooking', '==', idcthdbooking).get();
//         if (snapshot.empty) {
//             return res.status(404).send('Booking không tìm thấy');
//         }
//         const docId = snapshot.docs[0].id;


//         // Cập nhật trạng thái
//         await db.collection('CTHDBooking').doc(docId).update({
//             trangThai // Chỉ cập nhật trường trạng thái
//         });

//         // Nếu trạng thái mới là "Hoàn thành", thêm thông báo cho admin
//         if (trangThai === 'Hoàn thành') {
//             const notification = {
//                 message: `Booking ${idcthdbooking} Đã hoàn thành .`,
//                 createdAt: admin.firestore.FieldValue.serverTimestamp(),
//             };
//             await db.collection('Notifications').add(notification);  // Lưu thông báo vào Firestore
//         }

//         res.redirect('/bookings'); // Quay lại danh sách booking sau khi sửa
//     } catch (error) {
//         console.error("Lỗi khi cập nhật booking:", error);
//         res.status(500).send('Lỗi khi cập nhật booking');
//     }
// });


router.post('/editBooking/:idcthdbooking', async (req, res) => {
  const { idcthdbooking } = req.params;
  const { trangThai, lyDoHuy } = req.body;

  try {
      // Tìm booking trong bảng `CTHDBooking`
      const snapshot = await db.collection('CTHDBooking').where('idcthdbooking', '==', idcthdbooking).get();
      if (snapshot.empty) {
          return res.status(404).send('Booking không tìm thấy');
      }

      
      const docId = snapshot.docs[0].id;
      const booking = snapshot.docs[0].data();

      const currentTime = new Date(); // Thời gian hiện tại
      const bookingTime = booking.thoiGianDatLich.toDate();

      if (
        booking.trangThai === 'Đã xác nhận' && 
        (trangThai === 'Đã huỷ' || trangThai === 'Chưa xác nhận')
    ) {
        return res.status(400).render('editBooking', { 
            booking, 
            errorMessage: 'Không thể chuyển trạng thái từ "Đã xác nhận" sang "Chưa xác nhận".' 
        });
    }
  //   if (booking.trangThai === 'Đã xác nhận' && trangThai === 'Đã huỷ') {
  //     return res.status(400).render('editBooking', { 
  //         booking, 
  //         errorMessage: 'Không thể hủy đơn đã được xác nhận!', 
  //         allowCancel: false // Không cho phép hiển thị ô nhập lý do
  //     });
  // }


      // Kiểm tra nếu trạng thái là "Hoàn thành" mà thời gian hiện tại chưa đến thời gian đặt lịch
      if (trangThai === 'Hoàn thành' && currentTime < bookingTime) {
          return res.status(400).render('editBooking', { 
              booking, 
              errorMessage: 'Không thể hoàn thành đơn trước thời gian đặt lịch.' 
          });
      }

      // Cập nhật trạng thái đơn hàng
      const updateData = { trangThai };
      if (trangThai === 'Đã huỷ' && lyDoHuy) {
          updateData.lyDoHuy = lyDoHuy; // Lưu lý do huỷ nếu trạng thái là huỷ
      }

      await db.collection('CTHDBooking').doc(docId).update(updateData);


//=========================================================

    const snapshotuser = await db.collection('IDUser').where('iduser', '==', booking.iduser).get();
    const usertoken = snapshotuser.docs[0].data();
    // console.log(usertoken.iduser);

    
    const message = {
      notification: {
        title: `${booking.tenKhachHang} ơi!`,
        body: `Lịch đặt của bạn đã đổi trạng thái: ${trangThai}`
      },
      token: usertoken.user_token // Token của thiết bị nhận thông báo
    };


    messaging.send(message)
      .then((response) => {
        // console.log('Successfully sent message:', response);
      })
      .catch((error) => {
        console.log('Error sending message:', error);
      });
    //==========================================


      // Lấy email từ bảng `IDUser` dựa vào `iduser` trong booking
     // Lấy email từ bảng `IDUser` dựa vào `iduser` trong booking
if (booking.iduser) {
  // console.log(`Đang tìm email cho iduser: ${booking.iduser}`);
  const userSnapshot = await db.collection('IDUser').where('iduser', '==', booking.iduser).get();
  if (userSnapshot.empty) {
      console.error(`Không tìm thấy user với iduser: ${booking.iduser}`);
  } else {
      const userData = userSnapshot.docs[0].data();
      // console.log('Thông tin user tìm thấy:', userData);

      if (userData['email']) {

        const emailContent = `
                      <h2>Thông tin đặt lịch của bạn</h2>
                      <p><b>Tên khách hàng:</b> ${booking.tenKhachHang}</p>
                      <p><b>Số điện thoại:</b> ${booking.sdtNguoiDung}</p>
                      <p><b>Loại thú cưng:</b> ${booking.loaiThuCung}</p>
                      <p><b>Tên thú cưng:</b> ${booking.tenThuCung}</p>
                      <p><b>Dịch vụ:</b> ${booking.tenDichVu}</p>
                      <p><b>Giá dịch vụ:</b> ${booking.giaDichVu.toLocaleString()} VND</p>
                      <p><b>Trọng lượng thú cưng:</b> ${booking.canNang} kg</p>
                      <p><b>Thời gian đặt lịch:</b> ${new Date(booking.thoiGianDatLich.toDate()).toLocaleString()}</p>
                      <p><b>Trạng thái hiện tại:</b> ${trangThai}</p>
                      <br>
                      <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
                  `;

          const mailOptions = {
              from: 'tiepdv220601@gmail.com',
              to: userData['email'],
              subject: 'Cập nhật trạng thái đơn hàng',
              text: `Trạng thái đơn hàng ${idcthdbooking} của bạn đã được cập nhật thành: ${trangThai}.`,
              html: emailContent
          };

          // console.log('MailOptions trước khi gửi:', mailOptions);

          // Gửi email
          await transporter.sendMail(mailOptions);
          // console.log(`Email đã được gửi đến: ${userData['email']}`);
      } else {
          console.error(`Không tìm thấy trường 'e-mail' cho iduser: ${booking.iduser}`);
      }
  }
} else {
  console.error('Booking không có iduser.');
}


      // Thêm thông báo vào bảng `Notifications` nếu trạng thái là "Hoàn thành"
      if (trangThai === 'Hoàn thành') {
          const notification = {
              message: `Booking ${idcthdbooking} đã hoàn thành.`,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
          };
          await db.collection('Notifications').add(notification);
      }

      res.redirect('/bookings');
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
