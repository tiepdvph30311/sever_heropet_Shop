const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const moment = require('moment')



// Đường dẫn đến danh sách bookings
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('HoaDon').get();
    const HoaDon = snapshot.docs.map(doc => doc.data());

    // Render dữ liệu vào template (có thể dùng EJS, Pug, hoặc gửi dưới dạng JSON)
    res.render('HoaDon', { HoaDon });
  } catch (error) {
    console.error("Lỗi khi tải danh sách HoaDon:", error);  // Log lỗi chi tiết
    res.status(500).send('Lỗi khi tải danh sách HoaDon');
  }
});


// Sửa HoaDon
router.get('/editHoaDon/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const snapshot = await db.collection('HoaDon').where('id', '==', id).get();


    if (snapshot.empty) {
      return res.status(404).send('HoaDon không tìm thấy');
    }
    const HoaDon = snapshot.docs[0].data();




    const doccthd = await db.collection('ChitietHoaDon')
      .doc(HoaDon.UID)  // Document chứa subcollection ALL
      .collection('ALL')  // Truy vấn vào subcollection ALL
      .where('id_hoadon', '==', id)
      .get()

    const ChiTHd = doccthd.docs.map(doc => doc.data())

    const listCTHDSP = []


    //truy van id cua san pham
    await Promise.all(
      ChiTHd.map(async idProduct => {
        try {
          const docSP = await db.collection('SanPham')  // Truy vấn vào collection SanPham
            .doc(idProduct.id_product)  // Dùng id_product để truy vấn
            .get()

          if (docSP.exists) {
            listCTHDSP.push(docSP.data());
          } else {
            console.error('Không tìm thấy sản phẩm với ID:', idProduct.id_product);
          }

        } catch (error) {
          console.error('Lỗi khi truy vấn sản phẩm:', error);
        }
      })

    )



    const tong = listCTHDSP.map((item, index) => ({
      ...item,
      soLuongct: ChiTHd[index].soluong
    }));

    const ngaydathd = `${HoaDon.ngaydat}`



    // const ngaydathoad = HoaDon.ngaydat
    // function timestampToFormattedDate(ngaydathoad) {
    //   const date = new Date(ngaydathoad._seconds * 1000); // Chuyển đổi giây thành mili giây
    //   const year = date.getFullYear().toString().slice(-2); // Lấy 2 chữ số cuối của năm
    //   const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0, nên cộng 1 và thêm số 0 nếu cần
    //   const day = date.getDate().toString().padStart(2, '0');
    //   return `${month}/${day}/${year}`;
    // }

    // Ví dụ:
    //  console.log(formattedDate); 



    // if (ngaydathd.length == 10) {


    //   const formattedDate = ngaydathd
    //   res.render('editHoaDon', { HoaDon, listCTHDSP, ChiTHd, tong, formattedDate });
    // } else {

    //   const formattedDate = timestampToFormattedDate(ngaydathoad);

    //   res.render('editHoaDon', { HoaDon, listCTHDSP, ChiTHd, tong, formattedDate });
    // }
    
    res.render('editHoaDon', { HoaDon, listCTHDSP, ChiTHd, tong });

  } catch (error) {
    console.error("Lỗi khi sửa HoaDon:", error);
    res.status(500).send('Lỗi khi sửa HoaDon');
  }
});

// router.post('/editHoaDon/:id', async (req, res) => {

//   const { id } = req.params;
//   const { trangthai } = req.body;
//   try {

//     const snapshot = await db.collection('HoaDon').where('id', '==', id).get();

//     if (snapshot.empty) {
//       return res.status(404).send('HoaDon không tìm thấy');
//     }
//     const docId = snapshot.docs[0].id;

//     const HoaDon = snapshot.docs[0].data();


//     const ngaydathd = `${HoaDon.ngaydatfirebase}`

//     if (ngaydathd.length == 10) {
      
//       const parts = ngaydathd.split('/');
//       const date = new Date(parts[2], parts[1] - 1, parts[0]);
//       date.setUTCHours(date.getUTCHours() + 7); // Thiết lập múi giờ UTC+7

//       // Tạo Timestamp
//       const timestamp = new Date(date);
      
      
//       await db.collection('HoaDon').doc(docId).update({

//         trangthai: parseInt(trangthai),
//         ngaydatfirebase: timestamp
//       });
//     } else {
//       await db.collection('HoaDon').doc(docId).update({

//         trangthai: parseInt(trangthai)
//       });
//     }


//     res.redirect('/HoaDon'); // Quay lại danh sách booking sau khi sửa
//   } catch (error) {
//     console.error("Lỗi khi cập nhật HoaDon:", error);
//     res.status(500).send('Lỗi khi cập nhật HoaDon');
//   }
// });









// Xóa booking
// router.post('/editHoaDon/:id', async (req, res) => {
//   const { id } = req.params;
//   const { trangthai } = req.body;
  
//   try {
//     const snapshot = await db.collection('HoaDon').where('id', '==', id).get();

//     if (snapshot.empty) {
//       return res.status(404).send('HoaDon không tìm thấy');
//     }

//     const docId = snapshot.docs[0].id;  // Lấy document ID
//     const HoaDon = snapshot.docs[0].data(); // Lấy dữ liệu hóa đơn

//     // Xử lý ngày đặt hàng nếu cần
//     const ngaydathd = `${HoaDon.ngaydatfirebase}`;
//     if (ngaydathd.length == 10) {
//       const parts = ngaydathd.split('/');
//       const date = new Date(parts[2], parts[1] - 1, parts[0]);
//       date.setUTCHours(date.getUTCHours() + 7); // Thiết lập múi giờ UTC+7

//       const timestamp = new Date(date);

//       // Cập nhật trạng thái và ngày đặt hàng
//       await db.collection('HoaDon').doc(docId).update({
//         trangthai: parseInt(trangthai),
//         ngaydatfirebase: timestamp
//       });
//     } else {
//       // Chỉ cập nhật trạng thái
//       await db.collection('HoaDon').doc(docId).update({
//         trangthai: parseInt(trangthai)
//       });
//     }

//     // **Thêm thông báo nếu trạng thái là "Giao hàng thành công"**
//     if (parseInt(trangthai) === 3) { // Giả sử 3 là "Giao hàng thành công"
//       const notificationMessage = `Đơn hàng ${id} đã được giao thành công!`;

//       await db.collection('Notifications').add({
//         message: notificationMessage,
//         createdAt: admin.firestore.FieldValue.serverTimestamp() // Thời gian tạo thông báo
//       });
//     }

//     res.redirect('/HoaDon'); // Quay lại danh sách hóa đơn sau khi sửa
//   } catch (error) {
//     console.error("Lỗi khi cập nhật HoaDon:", error);
//     res.status(500).send('Lỗi khi cập nhật HoaDon');
//   }
// });

router.post('/editHoaDon/:id', async (req, res) => {
  const { id } = req.params;
  const { trangthai } = req.body;

  try {
    const snapshot = await db.collection('HoaDon').where('id', '==', id).get();

    if (snapshot.empty) {
      return res.status(404).send('Hóa đơn không tìm thấy');
    }

    const docId = snapshot.docs[0].id; // Lấy document ID
    const HoaDon = snapshot.docs[0].data(); // Lấy dữ liệu hóa đơn

    // Cập nhật trạng thái hóa đơn
    await db.collection('HoaDon').doc(docId).update({
      trangthai: parseInt(trangthai)
    });

    // Nếu trạng thái là "Giao hàng thành công" (3), trừ số lượng sản phẩm
    if (parseInt(trangthai) === 3) {
      // Lấy thông tin chi tiết hóa đơn từ collection ChitietHoaDon
      const cthdSnapshot = await db.collection('ChitietHoaDon')
        .doc(HoaDon.UID)  // Document chứa subcollection ALL
        .collection('ALL')  
        .where('id_hoadon', '==', id)
        .get();

      const chiTietHoaDon = cthdSnapshot.docs.map(doc => doc.data());

      // Trừ số lượng sản phẩm trong collection SanPham
      await Promise.all(
        chiTietHoaDon.map(async (item) => {
          const productRef = db.collection('SanPham').doc(item.id_product);

          try {
            const productSnap = await productRef.get();

            if (productSnap.exists) {
              const productData = productSnap.data();
              const currentQuantity = productData.soluong || 0;

              const newQuantity = currentQuantity - item.soLuong;

              if (newQuantity < 0) {
                console.warn(`Sản phẩm ${item.id_product} có số lượng không đủ.`);
              }

              // Cập nhật số lượng sản phẩm trong kho
              await productRef.update({
                soLuong: Math.max(newQuantity, 0) // Đảm bảo không giảm dưới 0
              });
            } else {
              console.error(`Sản phẩm ${item.id_product} không tồn tại.`);
            }
          } catch (error) {
            console.error(`Lỗi khi cập nhật số lượng sản phẩm ${item.id_product}:`, error);
          }
        })
      );

      // Thêm thông báo vào bảng Notifications
      const notificationMessage = `Đơn hàng ${id} đã được giao thành công và số lượng sản phẩm đã được cập nhật!`;
      await db.collection('Notifications').add({
        message: notificationMessage,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    res.redirect('/HoaDon'); // Quay lại danh sách hóa đơn
  } catch (error) {
    console.error("Lỗi khi cập nhật hóa đơn và trừ số lượng sản phẩm:", error);
    res.status(500).send('Lỗi khi cập nhật hóa đơn và trừ số lượng sản phẩm');
  }
});


router.get('/deleteBooking/:idBooking', async (req, res) => {
  const { idBooking } = req.params;
  try {
    const snapshot = await db.collection('bookings').where('idBooking', '==', idBooking).get();
    if (snapshot.empty) {
      return res.status(404).send('Booking không tìm thấy');
    }
    const docId = snapshot.docs[0].id;
    await db.collection('bookings').doc(docId).delete();
    res.redirect('/bookings'); // Quay lại danh sách booking sau khi xóa
  } catch (error) {
    console.error("Lỗi khi xóa booking:", error);
    res.status(500).send('Lỗi khi xóa booking');
  }
});


module.exports = router;
