const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Hiển thị danh sách dịch vụ
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('services').get();
    const services = snapshot.docs.map(doc => ({ idDichVu: doc.id, ...doc.data() }));
    res.render('services', { services });
  } catch (error) {
    res.status(500).send('Có lỗi xảy ra khi lấy dữ liệu dịch vụ.');
  }
});

// Hiển thị form thêm dịch vụ
router.get('/addService', (req, res) => {
  res.render('addService'); // Hiển thị form thêm dịch vụ
});

// Thêm dịch vụ
router.post('/addService', async (req, res) => {
    const { tenDichVu, gia, moTa, thoiGian, hoatDong } = req.body;
    try {
      const newService = {
        tenDichVu,
        gia: parseFloat(gia),
        moTa,
        thoiGian,
        hoatDong: hoatDong === 'on', // Checkbox gửi 'on' khi được chọn
      };
  
      // Thêm dịch vụ vào Firestore và lấy document reference
      const docRef = await db.collection('services').add(newService);
      
      // Lấy ID tự sinh của document
      const serviceId = docRef.id;
  
      // Cập nhật lại document, thêm trường idDichVu với giá trị bằng serviceId
      await docRef.update({
        idDichVu: serviceId, // Gán ID tự sinh vào trường idDichVu
      });
  
      // Sau khi thêm, chuyển hướng về danh sách dịch vụ
      res.redirect('/services');
    } catch (error) {
      res.status(500).send('Lỗi khi thêm dịch vụ');
    }
  });

// Hiển thị form chỉnh sửa dịch vụ
router.get('/edit-service/:id', async (req, res) => {
  const serviceId = req.params.id; // Lấy id từ URL
  try {
    const serviceDoc = await db.collection('services').doc(serviceId).get();
    
    if (!serviceDoc.exists) {
      res.status(404).send('Dịch vụ không tồn tại');
    } else {
      const service = serviceDoc.data();
      res.render('editService', { service });
    }
  } catch (error) {
    res.status(500).send('Lỗi khi lấy dữ liệu dịch vụ');
  }
});

// Cập nhật dịch vụ
router.post('/services/update-service/:id', async (req, res) => {
    const serviceId = req.params.id;
    const { tenDichVu, gia, moTa, thoiGian, hoatDong } = req.body;

    const updatedService = {
      tenDichVu,
      gia: parseFloat(gia),
      moTa,
      thoiGian,
      hoatDong: hoatDong === 'on', // Kiểm tra nếu checkbox được chọn
    };

    try {
      await db.collection('services').doc(serviceId).update(updatedService);
      res.redirect('/services'); // Quay lại danh sách dịch vụ
    } catch (error) {
      res.status(500).send('Lỗi khi cập nhật dịch vụ');
    }
  });

// Xóa dịch vụ
router.post('/delete-service/:id', async (req, res) => {
  try {
    const serviceId = req.params.id;
    await db.collection('services').doc(serviceId).delete();
    res.redirect('/services');
  } catch (error) {
    res.status(500).send('Lỗi khi xóa dịch vụ');
  }
});

module.exports = router;
