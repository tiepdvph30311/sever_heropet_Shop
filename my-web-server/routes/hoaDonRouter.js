const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const moment = require('moment')



// Đường dẫn đến danh sách bookings
// router.get('/', async (req, res) => {
//   try {
//     const snapshot = await db.collection('HoaDon').get();
//     const HoaDon = snapshot.docs.map(doc => doc.data());

//     // Render dữ liệu vào template (có thể dùng EJS, Pug, hoặc gửi dưới dạng JSON)
//     res.render('HoaDon', { HoaDon });
//   } catch (error) {
//     console.error("Lỗi khi tải danh sách HoaDon:", error);  // Log lỗi chi tiết
//     res.status(500).send('Lỗi khi tải danh sách HoaDon');
//   }
// });
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Trang hiện tại
    const limit = 5; // Số hóa đơn trên mỗi trang
    const startAt = (page - 1) * limit; // Vị trí bắt đầu

    // Lấy danh sách hóa đơn theo phân trang
    const snapshot = await db.collection('HoaDon')
      .offset(startAt)
      .limit(limit)
      .get();

    const HoaDon = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Tính tổng số hóa đơn
    const totalSnapshot = await db.collection('HoaDon').get();
    const totalDocuments = totalSnapshot.size;
    const totalPages = Math.ceil(totalDocuments / limit);

    // Render và truyền dữ liệu vào EJS
    res.render('HoaDon', { 
      HoaDon,
      currentPage: page, 
      totalPages 
    });
  } catch (error) {
    console.error("Lỗi khi tải danh sách Hóa Đơn:", error);
    res.status(500).send('Lỗi khi tải danh sách Hóa Đơn');
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
router.post('/editHoaDon/:id', async (req, res) => {
  const { id } = req.params;
  const { trangthai } = req.body;
  
  try {
    const snapshot = await db.collection('HoaDon').where('id', '==', id).get();

    if (snapshot.empty) {
      return res.status(404).send('HoaDon không tìm thấy');
    }

    const docId = snapshot.docs[0].id;  // Lấy document ID
    const HoaDon = snapshot.docs[0].data(); // Lấy dữ liệu hóa đơn

    // Xử lý ngày đặt hàng nếu cần
    const ngaydathd = `${HoaDon.ngaydatfirebase}`;
    if (ngaydathd.length == 10) {
      const parts = ngaydathd.split('/');
      const date = new Date(parts[2], parts[1] - 1, parts[0]);
      date.setUTCHours(date.getUTCHours() + 7); // Thiết lập múi giờ UTC+7

      const timestamp = new Date(date);

      // Cập nhật trạng thái và ngày đặt hàng
      await db.collection('HoaDon').doc(docId).update({
        trangthai: parseInt(trangthai),
        ngaydatfirebase: timestamp
      });
    } else {
      // Chỉ cập nhật trạng thái
      await db.collection('HoaDon').doc(docId).update({
        trangthai: parseInt(trangthai)
      });
    }

    // **Thêm thông báo nếu trạng thái là "Giao hàng thành công"**
    if (parseInt(trangthai) === 3) { // Giả sử 3 là "Giao hàng thành công"
      const notificationMessage = `Đơn hàng ${id} đã được giao thành công!`;

      await db.collection('Notifications').add({
        message: notificationMessage,
        createdAt: admin.firestore.FieldValue.serverTimestamp() // Thời gian tạo thông báo
      });
    }

    res.redirect('/HoaDon'); // Quay lại danh sách hóa đơn sau khi sửa
  } catch (error) {
    console.error("Lỗi khi cập nhật HoaDon:", error);
    res.status(500).send('Lỗi khi cập nhật HoaDon');
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
