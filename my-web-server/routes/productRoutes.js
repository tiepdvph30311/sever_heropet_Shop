const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Hiển thị danh sách sản phẩm
// Lỗi khi lấy dữ liệu sản phẩm
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('SanPham').get();
    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    console.log(products);
    res.render('index', { products });
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu sản phẩm:', error);
    res.status(500).send('Có lỗi xảy ra khi lấy dữ liệu sản phẩm.');
  }
});


// Hiển thị form thêm sản phẩm và truyền loại sản phẩm vào view
router.get('/add', async (req, res) => {
  try {
    const loaiProductsSnapshot = await db.collection('LoaiProduct').get();
    const loaiProducts = loaiProductsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.render('add', { loaiProducts });
  } catch (error) {
    console.error('Lỗi khi lấy loại sản phẩm:', error);
    res.status(500).send('Có lỗi xảy ra khi lấy loại sản phẩm.');
  }
});

// Thêm sản phẩm mới
router.post('/add', async (req, res) => {
  const { tensp, giatien, mota, loaisp, hansudung, soluong, trongluong, hinhanh, type } = req.body;

  try {
    const newProduct = {
      tensp,
      giatien: parseFloat(giatien),
      mota,
      loaisp,
      hansudung,
      soluong: parseInt(soluong),
      trongluong: trongluong,
      hinhanh,
      type: parseInt(type),
    };

    await db.collection('SanPham').add(newProduct); // Thêm sản phẩm vào Firestore
    res.redirect('/'); // Quay lại danh sách sản phẩm
  } catch (error) {
    console.error('Lỗi khi thêm sản phẩm:', error);
    res.status(500).send('Có lỗi xảy ra khi thêm sản phẩm.');
  }
});

// Hiển thị form sửa sản phẩm
router.get('/edit/:id', async (req, res) => {
  const productId = req.params.id;
  try {
    const productDoc = await db.collection('SanPham').doc(productId).get();
    if (!productDoc.exists) {
      return res.status(404).send('Sản phẩm không tồn tại.');
    }
    const product = productDoc.data();
    const loaiProductsSnapshot = await db.collection('LoaiProduct').get();
    const loaiProducts = loaiProductsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.render('edit', { product, loaiProducts });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin sản phẩm:', error);
    res.status(500).send('Có lỗi xảy ra khi lấy thông tin sản phẩm.');
  }
});

// Cập nhật sản phẩm
router.post('/update/:id', async (req, res) => {
  const productId = req.params.id;
  const { tensp, giatien, mota, loaisp, hansudung, soluong, trongluong, hinhanh, type } = req.body;

  try {
    const updatedProduct = {
      tensp,
      giatien: parseFloat(giatien),
      mota,
      loaisp,
      hansudung,
      soluong: parseInt(soluong),
      trongluong: trongluong,
      hinhanh,
      type: parseInt(type),
    };

    const productRef = db.collection('SanPham').doc(productId);
    const productDoc = await productRef.get();
    
    if (!productDoc.exists) {
      return res.status(404).send('Sản phẩm không tồn tại.');
    }

    await productRef.update(updatedProduct); // Cập nhật sản phẩm trong Firestore
    res.redirect('/'); // Quay lại danh sách sản phẩm
  } catch (error) {
    console.error('Lỗi khi cập nhật sản phẩm:', error);
    res.status(500).send('Có lỗi xảy ra khi cập nhật sản phẩm.');
  }
});

// Xóa sản phẩm
router.post('/delete/:id', async (req, res) => {
  const productId = req.params.id;
  try {
    const productRef = db.collection('SanPham').doc(productId);
    const productDoc = await productRef.get();
    
    if (!productDoc.exists) {
      return res.status(404).send('Sản phẩm không tồn tại.');
    }

    await productRef.delete(); // Xóa sản phẩm khỏi Firestore
    res.redirect('/'); // Quay lại danh sách sản phẩm
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm:', error);
    res.status(500).send('Có lỗi xảy ra khi xóa sản phẩm.');
  }
});

module.exports = router;
