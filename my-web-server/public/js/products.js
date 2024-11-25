const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Thêm sản phẩm
router.post('/add', async (req, res) => {
  const { gian, hansudung, hinhanh, loaisp, mota, soluong, tense, trongluong, kind } = req.body;

  try {
    const newProduct = {
      gian,
      hansudung,
      hinhanh,
      loaisp,
      mota,
      soluong,
      tense,
      trongluong,
      kind
    };

    const docRef = await db.collection('SanPham').add(newProduct);
    res.status(201).json({ message: 'Sản phẩm đã được thêm!', productId: docRef.id });
  } catch (error) {
    res.status(500).json({ message: 'Đã xảy ra lỗi!', error: error.message });
  }
});
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { giatien, hansudung, hinhanh, loaisp, mota, soluong, tense, trongluong, kind } = req.body;
  
    try {
      const productRef = db.collection('SanPham').doc(id);
      await productRef.update({
        giatien,
        hansudung,
        hinhanh,
        loaisp,
        mota,
        soluong,
        tense,
        trongluong,
        kind
      });
  
      res.status(200).json({ message: 'Sản phẩm đã được cập nhật!' });
    } catch (error) {
      res.status(500).json({ message: 'Đã xảy ra lỗi!', error: error.message });
    }
  });
  router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const productRef = db.collection('SanPham').doc(id);
      await productRef.delete();
      res.status(200).json({ message: 'Sản phẩm đã bị xóa!' });
    } catch (error) {
      res.status(500).json({ message: 'Đã xảy ra lỗi!', error: error.message });
    }
  });
  

module.exports = router;
