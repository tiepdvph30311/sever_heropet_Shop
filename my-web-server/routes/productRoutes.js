const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');

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


const bucketName = 'heropetshop-bc414.firebasestorage.app'

const uploadImage = async (file) => {
  const blob = bucket.file(file.originalname);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  return new Promise((resolve, reject) => {
    blobStream.on('error', (err) => {
      reject(err);
    });

    blobStream.on('finish', () => {
      // Tạo URL công khai cho hình ảnh
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(file.originalname)}?alt=media`;
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
};

const bucket = admin.storage().bucket();
const multerMid = multer({ storage: multer.memoryStorage() });

// Thêm sản phẩm mới
router.post('/add',multerMid.single('hinhanh'), async (req, res) => {
  const { tensp, giatien, mota, loaisp, hansudung, soluong, trongluong, type } = req.body;
  const imageUrl = await uploadImage(req.file);

  try {
    const newProduct = {
      tensp,
      giatien: parseFloat(giatien),
      mota,
      loaisp,
      hansudung,
      soluong: parseInt(soluong),
      trongluong,
      hinhanh: imageUrl,
      type: parseInt(type),
    };
      

     const docRef = await db.collection('SanPham').add(newProduct);
      
     const sanPhamId = docRef.id;
 
     await docRef.update({
       id: sanPhamId, 
     });
 


    res.redirect('/product'); // Quay lại danh sách sản phẩm
  } catch (error) {
    console.error('Lỗi khi thêm sản phẩm:', error);
    res.status(500).send('Có lỗi xảy ra khi thêm sản phẩm.');
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


router.get('/ChiTietSP/:id', async (req, res) => {
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
      res.render('ctsanpham', { product, loaiProducts });
    }
  } catch (error) {
    res.status(500).send('Lỗi khi lấy dữ liệu sản phẩm');
  }
});

// Route cập nhật sản phẩm
router.post('/update/:id',multerMid.single('hinhanh'), async (req, res) => {
  const productId = req.params.id; // Lấy ID từ URL
  const { tensp, giatien, mota, loaisp, hansudung, soluong, trongluong, type } = req.body;
  const imageUrl = await uploadImage(req.file);

  try {
    const updatedProduct = {
      tensp,
      giatien: parseFloat(giatien),
      mota,
      loaisp,
      hansudung,
      soluong: parseInt(soluong),
      trongluong,
      hinhanh: imageUrl,
      type: parseInt(type),
    };

    const productRef = db.collection('SanPham').doc(productId);
    const productDoc = await productRef.get();
    
    if (!productDoc.exists) {
      return res.status(404).send('Sản phẩm không tồn tại.');
    }

    await productRef.update(updatedProduct); // Cập nhật sản phẩm trong Firestore
    res.redirect('/product'); // Quay lại danh sách sản phẩm
  } catch (error) {
    console.error('Lỗi khi cập nhật sản phẩm:', error);
    res.status(500).send('Có lỗi xảy ra khi cập nhật sản phẩm.');
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