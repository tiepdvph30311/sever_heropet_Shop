const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const moment = require('moment');

// Route thống kê doanh thu
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Chuyển startDate và endDate thành đối tượng Date



    // const start = startDate ? new Date(startDate) : null;
    // const end = endDate ? new Date(endDate) : null;
    

    const start = startDate ? moment(startDate, 'YYYY-MM-DD').startOf('day').toDate() : null;
    const end = endDate ? moment(endDate, 'YYYY-MM-DD').endOf('day').toDate() : null;





    // Tạo query Firestore để lọc theo thời gian và trạng thái "Đã xác nhận"
    let query = db.collection('HoaDon').where('trangthai', '==', 3); // Thêm điều kiện lọc theo trạng thái

    if (start && end) {
      query = query.where('ngaydatfirebase', '>=', admin.firestore.Timestamp.fromDate(start))
        .where('ngaydatfirebase', '<=', admin.firestore.Timestamp.fromDate(end));
    }



    const snapshot = await query.get();
    const serviceUsage = {};
    let totalRevenue = 0;

    const HoaDon = snapshot.docs.map(doc => doc.data());
    // console.log(HoaDon);

    snapshot.forEach(doc => {
      const data = doc.data();
      const serviceName = data.hoten;
      const servicePrice = data.tongtien || 0;

      // Cộng dồn số lượng và doanh thu của dịch vụ
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

    // Render thống kê doanh thu


    function calculateTotalAmount(HoaDon) {
      return HoaDon.reduce((total, order) => {
        let amount = 0;
    
        if (typeof order.tongtien === 'string') {
          // Thay thế dấu '.' thành rỗng (xóa dấu phân cách hàng nghìn)
          const sanitizedValue = order.tongtien.replace(/\./g, '');
          amount = Number(sanitizedValue); // Chuyển thành số nguyên
        } else if (typeof order.tongtien === 'number') {
          amount = order.tongtien;
        } else {
          console.error('Giá trị tongtien không hợp lệ:', order.tongtien);
          return total; // Bỏ qua giá trị không hợp lệ
        }
    
        if (isNaN(amount)) {
          console.error('Không thể chuyển đổi thành số:', order.tongtien);
          return total; // Bỏ qua nếu lỗi
        }
    
        return total + amount;
      }, 0);
    }
    
    
    

    const totalAmount = calculateTotalAmount(HoaDon);

    res.render('doanhthusp', {
      startDate: startDate || '',
      endDate: endDate || '',
      HoaDon,
      totalRevenue,
      totalAmount
    });



  } catch (error) {
    console.error('Lỗi khi lấy thống kê:', error);
    res.status(500).send('Lỗi khi lấy thống kê');
  }
});



// Sửa HoaDon
router.get('/chitietdoanhthu/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const snapshot = await db.collection('HoaDon').where('id', '==', id).get();


    if (snapshot.empty) {
      return res.status(404).send('HoaDon không tìm thấy');
    }
    const HoaDon = snapshot.docs[0].data();


    // const ngaydathoad = HoaDon.ngaydat
    // function timestampToFormattedDate(ngaydathoad) {
    //   const date = new Date(ngaydathoad._seconds * 1000); // Chuyển đổi giây thành mili giây
    //   const year = date.getFullYear().toString().slice(-2); // Lấy 2 chữ số cuối của năm
    //   const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0, nên cộng 1 và thêm số 0 nếu cần
    //   const day = date.getDate().toString().padStart(2, '0');
    //   return `${month}/${day}/${year}`;
    // }
    
    // Ví dụ:
    // const formattedDate = timestampToFormattedDate(ngaydathoad);
    // console.log(formattedDate); 
    // console.log(HoaDon.ngaydat);
    



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






    res.render('chitietdoanhthusp', { HoaDon, listCTHDSP, ChiTHd, tong }); // Gửi thông tin booking để hiển thị lên form sửa
  } catch (error) {
    console.error("Lỗi khi sửa HoaDon:", error);
    res.status(500).send('Lỗi khi sửa HoaDon');
  }
});


module.exports = router;
