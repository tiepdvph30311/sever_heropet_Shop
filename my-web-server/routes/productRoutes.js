const express = require('express');
const router = express.Router(); // Sử dụng router thay vì app
const admin = require('firebase-admin');
const db = admin.firestore();

// Hiển thị danh sách sản phẩm
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection('SanPham').get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.render("index", { products });
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    res.status(500).send("Có lỗi xảy ra khi lấy dữ liệu.");
  }
});
router.get("/add", (req, res) => {
  res.render("add"); // Hiển thị form thêm sản phẩm
});

router.post("/add", async (req, res) => {
  const { tense, giatien, loaisp, mota, hansudung, soluong, trongluong, hinhanh } = req.body;

  try {
    const newProduct = {
      tense,
      giatien,
      loaisp,
      mota,
      hansudung,
      soluong,
      trongluong,
      hinhanh,
    };

    // Thêm sản phẩm mới vào Firestore
    await db.collection('SanPham').add(newProduct);
    res.redirect("/"); // Quay lại trang danh sách sản phẩm
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm:", error);
    res.status(500).send("Có lỗi xảy ra khi thêm sản phẩm.");
  }
});


// Hiển thị form sửa sản phẩm
router.get("/edit/:id", async (req, res) => {
  const productId = req.params.id; // Lấy ID từ URL
  try {
    const productRef = db.collection('SanPham').doc(productId); // Lấy tài liệu từ Firestore
    const productDoc = await productRef.get(); // Lấy dữ liệu sản phẩm
    if (!productDoc.exists) {
      return res.status(404).send("Sản phẩm không tồn tại.");
    }
    // Truyền dữ liệu sản phẩm và ID đến view
    res.render("edit", { product: productDoc.data(), id: productId });
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm:", error);
    res.status(500).send("Có lỗi xảy ra khi lấy sản phẩm.");
  }
});


// Cập nhật sản phẩm
router.post("/update/:id", async (req, res) => {
  const productId = req.params.id;
  const { tense, giatien, loaisp, mota, hansudung, soluong, trongluong, hinhanh } = req.body;
  try {
    const productRef = db.collection('SanPham').doc(productId);
    await productRef.update({
      tense,
      giatien,
      loaisp,
      mota,
      hansudung,
      soluong,
      trongluong,
      hinhanh,
    });
    res.redirect("/");
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    res.status(500).send("Có lỗi xảy ra khi cập nhật sản phẩm.");
  }
});

// Xóa sản phẩm
router.post("/delete/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    const productRef = db.collection('SanPham').doc(productId);
    await productRef.delete();
    res.redirect("/");
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    res.status(500).send("Có lỗi xảy ra khi xóa sản phẩm.");
  }
});

// Thêm sản phẩm mới
router.post("/add", async (req, res) => {
  const { tense, giatien, loaisp, mota, hansudung, soluong, trongluong, hinhanh } = req.body;
  try {
    const newProduct = {
      tense,
      giatien,
      loaisp,
      mota,
      hansudung,
      soluong,
      trongluong,
      hinhanh,
    };
    const docRef = await db.collection('SanPham').add(newProduct);
    res.redirect("/");
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm:", error);
    res.status(500).send("Có lỗi xảy ra khi thêm sản phẩm.");
  }
});

module.exports = router; // Xuất router để sử dụng trong app.js
