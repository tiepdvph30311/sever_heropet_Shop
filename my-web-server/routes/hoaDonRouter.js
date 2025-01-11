const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const moment = require('moment')



// Đường dẫn đến danh sách bookings
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Trang hiện tại
    const limit = 10; // Số hóa đơn trên mỗi trang
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


    res.render('editHoaDon', { HoaDon, listCTHDSP, ChiTHd, tong });

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


    const HoaDon = snapshot.docs[0].data();

    const doccthd = await db.collection('ChitietHoaDon')
      .doc(HoaDon.UID)  // Document chứa subcollection ALL
      .collection('ALL')  // Truy vấn vào subcollection ALL
      .where('id_hoadon', '==', id)
      .get()

    const ChiTHd = doccthd.docs.map(doc => doc.data())


    const product = await db.collection('SanPham').get();
    const products = product.docs.map(doc => doc.data());



    if (trangthai == 3) {
      function updateSoluong(products, ChiTHd) {
        // Tạo một Map để lưu trữ số lượng cần trừ đi cho từng id trong listds
        const soluongMap = new Map();
        ChiTHd.forEach(item => {
          soluongMap.set(item.id_product, item.soluong);
        });

        // Duyệt qua mảng sanpham và cập nhật số lượng
        products.forEach(async item => {
          const soluongTru = soluongMap.get(item.id);
          if (soluongTru) {
            // Kiểm tra xem số lượng còn lại có âm không
            await db.collection('SanPham').doc(item.id).update({

              soluong: item.soluong = Math.max(item.soluong - soluongTru, 0)
            });



          }
        });

        return products;
      }

      const updatedSanPham = updateSoluong(products, ChiTHd);


    }



    const docId = snapshot.docs[0].id;



    const ngaydathd = `${HoaDon.ngaydatfirebase}`

    if (ngaydathd.length == 10) {

      const parts = ngaydathd.split('/');
      const date = new Date(parts[2], parts[1] - 1, parts[0]);
      date.setUTCHours(date.getUTCHours() + 7); // Thiết lập múi giờ UTC+7

      // Tạo Timestamp
      const timestamp = new Date(date);


      await db.collection('HoaDon').doc(docId).update({

        trangthai: parseInt(trangthai),
        ngaydatfirebase: timestamp
      });
    } else {
      await db.collection('HoaDon').doc(docId).update({

        trangthai: parseInt(trangthai)
      });
    }


    res.redirect('/HoaDon/editHoaDon/'+HoaDon.id); // Quay lại danh sách booking sau khi sửa
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
