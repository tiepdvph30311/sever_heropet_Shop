const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Route hiển thị danh sách sản phẩm
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('SanPham').get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.render('product', { products });
  } catch (error) {
    res.status(500).send('Có lỗi xảy ra khi lấy dữ liệu sản phẩm.');
  }
});

// Route hiển thị form sửa sản phẩm
router.get('/edit/:id', async (req, res) => {
  const productId = req.params.id;
  try {
    const productDoc = await db.collection('SanPham').doc(productId).get();
    if (!productDoc.exists) {
      res.status(404).send('Sản phẩm không tồn tại');
    } else {
      const product = productDoc.data();
      // Lấy danh sách loại sản phẩm (loaiProducts)
      const loaiProductsSnapshot = await db.collection('LoaiProduct').get();
      const loaiProducts = loaiProductsSnapshot.docs.map(doc => doc.data());
      res.render('edit', { product, loaiProducts });
    }
  } catch (error) {
    res.status(500).send('Lỗi khi lấy dữ liệu sản phẩm');
  }
});

// Route cập nhật sản phẩm
router.post('/update/:id', async (req, res) => {
  const productId = req.params.id;
  const { tensp, giatien, mota, loaisp, hansudung, soluong, trongluong, hinhanh, type } = req.body;

  const updatedProduct = {
    tensp,
    giatien: parseFloat(giatien),
    mota,
    loaisp,
    hansudung,
    soluong: parseInt(soluong),
    trongluong: parseInt(trongluong),
    hinhanh,
    type: parseInt(type),
  };

  try {
    await db.collection('SanPham').doc(productId).update(updatedProduct);
    res.redirect('/product');
  } catch (error) {
    res.status(500).send('Lỗi khi cập nhật sản phẩm');
  }
});

// Route xóa sản phẩm
router.post('/delete/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    await db.collection('SanPham').doc(productId).delete();
    res.redirect('/product');
  } catch (error) {
    res.status(500).send('Lỗi khi xóa sản phẩm');
  }
});

module.exports = router;
