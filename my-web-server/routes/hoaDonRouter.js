const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();



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
    ChiTHd.map( async idProduct => {
      try{
        const docSP =await db.collection('SanPham')  // Truy vấn vào collection SanPham
        .doc(idProduct.id_product)  // Dùng id_product để truy vấn
        .get()

        if (docSP.exists) {
          listCTHDSP.push(docSP.data());
        } else {
          console.error('Không tìm thấy sản phẩm với ID:', idProduct.id_product);
        }

      }catch(error) {
        console.error('Lỗi khi truy vấn sản phẩm:', error);
      }
    })

  )


    res.render('editHoaDon', { HoaDon,listCTHDSP,ChiTHd }); // Gửi thông tin booking để hiển thị lên form sửa
  } catch (error) {
    console.error("Lỗi khi sửa HoaDon:", error);
    res.status(500).send('Lỗi khi sửa HoaDon');
  }
});

router.post('/editHoaDon/:id', async (req, res) => {
  const { id } = req.params;
  const { trangthai } = req.body;
  try {
    const snapshot = await db.collection('HoaDon').where('id', '==', id).get();
    if (snapshot.empty) {
      return res.status(404).send('HoaDon không tìm thấy');
    }
    const docId = snapshot.docs[0].id;
    await db.collection('HoaDon').doc(docId).update({

      trangthai: parseInt(trangthai)
    });

    res.redirect('/HoaDon'); // Quay lại danh sách booking sau khi sửa
  } catch (error) {
    console.error("Lỗi khi cập nhật HoaDon:", error);
    res.status(500).send('Lỗi khi cập nhật HoaDon');
  }
});









// Xóa booking
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
