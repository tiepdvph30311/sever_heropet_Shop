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




// router.get('/', async (req, res) => {
//   try {
//       const { fromDate, toDate,phoneNumber } = req.query; // Get the date range from the query parameters
//       const page = parseInt(req.query.page) || 1; // Trang hiện tại
//       const pageSize = 50; // Số lượng phần tử trên mỗi trang
//       const startAt = (page - 1) * pageSize;

//       let query = db.collection('CTHDBooking').orderBy('thoiGianDatLich', 'desc'); // Sắp xếp giảm dần

//       // Filter by date range if fromDate and toDate are provided
//       if (fromDate && toDate) {
//           query = query.where('thoiGianDatLich', '>=', new Date(fromDate))
//                        .where('thoiGianDatLich', '<=', new Date(toDate));
//       }
//       if (phoneNumber) {
//         query.sdtNguoiDung = phoneNumber;
//       }

//       // Fetch the bookings with pagination
//       const snapshot = await query.offset(startAt).limit(pageSize).get();

//       const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

//       // Fetch profile info for each booking
//       for (let booking of bookings) {
//           if (booking.iduser) {
//               const profilesSnapshot = await db.collection('User')
//                   .doc(booking.iduser)
//                   .collection('Profile')
//                   .get();

//               if (!profilesSnapshot.empty) {
//                   const profileData = profilesSnapshot.docs[0].data();
//                   booking.hoten = profileData.hoten || 'Không xác định';
//                   booking.sdt = profileData.sdt || 'Không xác định';
//               } else {
//                   booking.hoten = 'Không xác định';
//                   booking.sdt = 'Không xác định';
//               }
//           } else {
//               booking.hoten = 'Không xác định';
//               booking.sdt = 'Không xác định';
//           }
//       }

//       // Get the total count of bookings for pagination
//       const totalSnapshot = await db.collection('CTHDBooking').get();
//       const totalRecords = totalSnapshot.size;
//       const totalPages = Math.ceil(totalRecords / pageSize);

//       res.render('bookings', {
//           bookings,
//           currentPage: page,
//           totalPages: totalPages,
//           fromDate: fromDate || '', // Pass the fromDate to the template
//           toDate: toDate || '',     // Pass the toDate to the template
//           phoneNumber
//       });
//   } catch (error) {
//       console.error('Error loading bookings:', error);
//       res.status(500).send('Error loading bookings');
//   }
// });


// router.get('/', async (req, res) => {
//     try {
//       const { fromDate, toDate, phoneNumber } = req.query; // Get the date range from the query parameters
//       const page = parseInt(req.query.page) || 1; // Trang hiện tại
//       const pageSize = 20; // Số lượng phần tử trên mỗi trang
//       const startAt = (page - 1) * pageSize;
  
//       // Lọc theo ngày nếu có
//       let query = db.collection('CTHDBooking').orderBy('thoiGianDatLich', 'desc'); // Sắp xếp giảm dần theo thời gian
  
//       if (fromDate && toDate) {
//         query = query.where('thoiGianDatLich', '>=', new Date(fromDate))
//                      .where('thoiGianDatLich', '<=', new Date(toDate));
//       }
  
//       // Fetch the bookings with pagination
//       const snapshot = await query.offset(startAt).limit(pageSize).get();
  
//       let bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
//       // Nếu có sdtNguoiDung, lọc thêm
//       if (phoneNumber) {
//         bookings = bookings.filter(booking => booking.sdtNguoiDung === phoneNumber);
//       }
  
//       // Fetch thông tin người dùng cho từng booking
//       for (let booking of bookings) {
//         if (booking.iduser) {
//           const profilesSnapshot = await db.collection('User')
//             .doc(booking.iduser)
//             .collection('Profile')
//             .get();
  
//           if (!profilesSnapshot.empty) {
//             const profileData = profilesSnapshot.docs[0].data();
//             booking.hoten = profileData.hoten || 'Không xác định';
//             booking.sdt = profileData.sdt || 'Không xác định';
//           } else {
//             booking.hoten = 'Không xác định';
//             booking.sdt = 'Không xác định';
//           }
//         } else {
//           booking.hoten = 'Không xác định';
//           booking.sdt = 'Không xác định';
//         }
//       }
  
//       // Lấy tổng số bản ghi cho phân trang
//       const totalSnapshot = await db.collection('CTHDBooking').get();
//       const totalRecords = totalSnapshot.size;
//       const totalPages = Math.ceil(totalRecords / pageSize);
  
//       res.render('bookings', {
//         bookings,
//         currentPage: page,
//         totalPages: totalPages,
//         fromDate: fromDate || '', // Truyền từ ngày vào template
//         toDate: toDate || '',     // Truyền đến ngày vào template
//         phoneNumber
//       });
//     } catch (error) {
//       console.error('Error loading bookings:', error);
//       res.status(500).send('Error loading bookings');
//     }
//   });
router.get('/', async (req, res) => {
    try {
        const { fromDate, toDate, phoneNumber } = req.query; // Get the date range from the query parameters
        const page = parseInt(req.query.page) || 1; // Trang hiện tại
        const pageSize = 20; // Số lượng phần tử trên mỗi trang
        const startAt = (page - 1) * pageSize;
  
        // Lọc theo ngày nếu có
        let query = db.collection('CTHDBooking')
                      .orderBy('thoiGianDatLich', 'desc') // Sắp xếp giảm dần theo thời gian
                      .where('trangThai', 'in', ['Chưa xác nhận', 'Đã xác nhận']); // Chỉ lấy đơn có trạng thái phù hợp
  
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
  
        res.render('bookings', {
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

    
// router.get('/details/:idcthdbooking', async (req, res) => {
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
  
//       // Calculate the total price of all services
//       const totalServicePrice = serviceDetails.reduce((total, service) => total + service.gia, 0);
  
//       // Calculate the additional fee
//       const additionalFee = booking.giaDichVu - totalServicePrice;
  
//       res.render('bookingDetail', {
//         booking,
//         userProfile,
//         serviceDetails,
//         totalServicePrice,
//         additionalFee
//       });
//     } catch (error) {
//       console.error('Error fetching booking details:', error);
//       res.status(500).send('Error fetching booking details');
//     }
//   });
  
router.get('/details/:idcthdbooking', async (req, res) => {
    const { idcthdbooking } = req.params;
    // console.log('ID CTHDBooking:', idcthdbooking);
    try {
        const snapshot = await db.collection('CTHDBooking').where('idcthdbooking', '==', idcthdbooking).get();
        if (snapshot.empty) {
            return res.status(404).send('Booking not found');
        }
        const booking = snapshot.docs[0].data();

        // Fetch service details from CTBooking based on idcthdbooking
        const serviceDetails = [];
        const ctBookingSnapshot = await db.collection('CTBooking')
            .where('idcthdbooking', '==', idcthdbooking)
            .get();

        if (!ctBookingSnapshot.empty) {
            ctBookingSnapshot.forEach(doc => {
                const service = doc.data();
                serviceDetails.push(service);
            });
        }

        // console.log('Service Details:', serviceDetails);

        // Calculate the total price of all services
        const totalServicePrice = serviceDetails.reduce((total, service) => total + service.gia, 0);

        // Calculate the additional fee
        const additionalFee = booking.giaDichVu - totalServicePrice;

        res.render('bookingDetail', {
            booking,
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

// Tìm kiếm booking theo số điện thoại khách hàng
router.get('/searchByPhone', async (req, res) => {
  const { phoneNumber } = req.query;
  try {
      let bookingsSnapshot;
      let isSearch = false;

      // Kiểm tra nếu số điện thoại được cung cấp
      if (phoneNumber && phoneNumber.trim() !== '') {
          console.log("Đang tìm kiếm khách hàng với số điện thoại:", phoneNumber.trim());
          isSearch = true;

          // Lọc theo số điện thoại khách hàng (trường sdtNguoiDung)
          bookingsSnapshot = await db.collection('CTHDBooking')
              .where('sdtNguoiDung', '>=', phoneNumber.trim())
              .where('sdtNguoiDung', '<=', phoneNumber.trim() + '\uf8ff')
              .get();
      } else {
          // Lấy toàn bộ bookings nếu không có tìm kiếm
          bookingsSnapshot = await db.collection('CTHDBooking').get();
      }

      const bookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      console.log("Danh sách bookings tìm thấy:", bookings);

      // Hiển thị danh sách bookings với điều kiện tìm kiếm hoặc không
      res.render('bookings', {
          bookings,
          currentPage: 1,
          totalPages: 1,
          phoneNumber: phoneNumber || '', // Trả lại số điện thoại tìm kiếm (nếu có)
          isSearch
      });
  } catch (error) {
      console.error('Lỗi khi tìm kiếm bookings theo số điện thoại:', error);
      res.status(500).send('Lỗi khi tìm kiếm bookings theo số điện thoại.');
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
      const bookingTime = booking.thoiGianDatLich.toDate(); // Thời gian đặt lịch của booking

      // Kiểm tra trạng thái đang là "Đang xử lý" và không chuyển sang bất kỳ trạng thái khác ngoài "Hoàn thành"
      if (booking.trangThai === 'Đang xử lý' && trangThai !== 'Hoàn thành') {
          return res.status(400).render('editBooking', { 
              booking, 
              errorMessage: 'Chỉ có thể chuyển trạng thái từ "Đang xử lý" sang "Hoàn thành".'
          });
      }

      // Kiểm tra trạng thái "Chưa xác nhận" không thể chuyển sang "Đang xử lý"
      if (booking.trangThai === 'Chưa xác nhận' && trangThai === 'Đang xử lý') {
          return res.status(400).render('editBooking', { 
              booking, 
              errorMessage: 'Chưa xác nhận, bạn phải chuyển sang "Đã xác nhận" trước khi chuyển sang "Đang xử lý".'
          });
      }

      // Kiểm tra thời gian đặt lịch để cho phép chuyển sang trạng thái "Đang xử lý"
      if (trangThai === 'Đang xử lý') {
          const timeDifference = currentTime - bookingTime; // Chênh lệch thời gian giữa thời gian hiện tại và giờ đã đặt

          // Kiểm tra nếu thời gian hiện tại ít hơn 30 phút sau thời gian đặt lịch
          if (timeDifference < 1 * 60 * 1000) { // 1 phút = 30 * 60 * 1000 ms
              return res.status(400).render('editBooking', { 
                  booking, 
                  errorMessage: 'Đơn hàng chưa tới giờ ! Bạn phải đợi ít nhất 1 phút sau giờ đã đặt để chuyển trạng thái sang "Đang xử lý".' 
              });
          }
      }

      // Kiểm tra trạng thái "Hoàn thành" mà thời gian hiện tại chưa đến thời gian đặt lịch
      if (trangThai === 'Hoàn thành' && currentTime < bookingTime) {
          return res.status(400).render('editBooking', { 
              booking, 
              errorMessage: 'Không thể hoàn thành đơn trước thời gian đặt lịch.' 
          });
      }

      // Cập nhật trạng thái đơn hàng
      const updateData = { trangThai };
      if (trangThai === 'Đã hủy') {
        updateData.trangThaiHuy = false; // Thêm trạng thái hoàn tiền
        updateData.tienHuy = 0;         // Thêm giá trị tiền hủy
    }
      if (trangThai === 'Đã hủy' && lyDoHuy) {
          updateData.lyDoHuy = lyDoHuy; // Lưu lý do huỷ nếu trạng thái là huỷ
      }

      await db.collection('CTHDBooking').doc(docId).update(updateData);

      //=========================================================

      const snapshotuser = await db.collection('IDUser').where('iduser', '==', booking.iduser).get();
      const usertoken = snapshotuser.docs[0].data();

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
    //   if (booking.iduser) {
    //       const userSnapshot = await db.collection('IDUser').where('iduser', '==', booking.iduser).get();
    //       if (userSnapshot.empty) {
    //           console.error(`Không tìm thấy user với iduser: ${booking.iduser}`);
    //       } else {
    //           const userData = userSnapshot.docs[0].data();
    //           if (userData['email']) {
    //               const emailContent = `
    //                   <h2>Thông tin đặt lịch của bạn</h2>
    //                   <p><b>Tên khách hàng:</b> ${booking.tenKhachHang}</p>
    //                   <p><b>Số điện thoại:</b> ${booking.sdtNguoiDung}</p>
    //                   <p><b>Loại thú cưng:</b> ${booking.loaiThuCung}</p>
    //                   <p><b>Tên thú cưng:</b> ${booking.tenThuCung}</p>
    //                   <p><b>Dịch vụ:</b> ${booking.tenDichVu}</p>
    //                   <p><b>Giá dịch vụ:</b> ${booking.giaDichVu.toLocaleString()} VND</p>
    //                   <p><b>Trọng lượng thú cưng:</b> ${booking.canNang} kg</p>
    //                   <p><b>Thời gian đặt lịch:</b> ${new Date(booking.thoiGianDatLich.toDate()).toLocaleString()}</p>
    //                   <p><b>Trạng thái hiện tại:</b> ${trangThai}</p>
                      
    //                   <br>
    //                   <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
    //               `;

    //               const mailOptions = {
    //                   from: 'tiepdv220601@gmail.com',
    //                   to: userData['email'],
    //                   subject: 'Cập nhật trạng thái đơn hàng',
    //                   text: `Trạng thái đơn hàng ${idcthdbooking} của bạn đã được cập nhật thành: ${trangThai}.`,
    //                   html: emailContent
    //               };

    //               // Gửi email
    //               await transporter.sendMail(mailOptions);
    //           } else {
    //               console.error(`Không tìm thấy trường 'e-mail' cho iduser: ${booking.iduser}`);
    //           }
    //       }
    //   } else {
    //       console.error('Booking không có iduser.');
    //   }
    if (booking.iduser) {
        const userSnapshot = await db.collection('IDUser').where('iduser', '==', booking.iduser).get();
        if (userSnapshot.empty) {
            console.error(`Không tìm thấy user với iduser: ${booking.iduser}`);
        } else {
            const userData = userSnapshot.docs[0].data();
            if (userData['email']) {
                let emailContent = `
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
                `;
    
                // Nếu trạng thái là "Đã hủy", thêm mục lý do hủy vào email
                if (trangThai === 'Đã hủy' && lyDoHuy) {
                    emailContent += `
                        <p><b>Lý do hủy:</b> ${lyDoHuy}</p>
                    `;
                }
    
                emailContent += `
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
    
                // Gửi email
                await transporter.sendMail(mailOptions);
            } else {
                console.error(`Không tìm thấy trường 'email' cho iduser: ${booking.iduser}`);
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



router.get('/searchbooking', async (req, res) => {
  const { fromDate, toDate } = req.query;
  try {
      let bookingsSnapshot;
      let isSearch = false;

      // Kiểm tra nếu từ ngày và đến ngày được cung cấp
      if (fromDate && toDate) {
          console.log("Đang tìm kiếm bookings từ ngày:", fromDate, "đến ngày:", toDate);
          isSearch = true;

          // Convert string date to Firestore Timestamp
          const fromTimestamp = admin.firestore.Timestamp.fromDate(new Date(fromDate));
          const toTimestamp = admin.firestore.Timestamp.fromDate(new Date(toDate));

          // Lọc theo ngày đặt lịch trong khoảng thời gian từ 'fromDate' đến 'toDate'
          bookingsSnapshot = await db.collection('CTHDBooking')
              .where('thoiGianDatLich', '>=', fromTimestamp)
              .where('thoiGianDatLich', '<=', toTimestamp)
              .get();
      } else {
          // Lấy toàn bộ bookings nếu không có tìm kiếm theo ngày
          bookingsSnapshot = await db.collection('CTHDBooking').get();
      }

      const bookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Hiển thị kết quả tìm kiếm
      res.render('bookings', {
          bookings,
          currentPage: 1,
          totalPages: 1,
          fromDate: fromDate || '', // Trả lại giá trị fromDate
          toDate: toDate || '',     // Trả lại giá trị toDate
          isSearch
      });
  } catch (error) {
      console.error('Lỗi khi tìm kiếm bookings:', error);
      res.status(500).send('Lỗi khi tìm kiếm bookings.');
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
