const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

router.get('/', async (req, res) => {
  try {
      const { page = 1, limit = 10, search = '' } = req.query;

      // Chuyển đổi page và limit sang số nguyên
      const currentPage = parseInt(page, 10);
      const itemsPerPage = parseInt(limit, 10);

      // Fetch dữ liệu từ Firestore
      const snapshot = await db.collection('IDUser').get();
      const bookings = snapshot.docs.map(doc => doc.data());
      let arayUserId = bookings.map(doc => doc.iduser);

      // Lọc và tìm kiếm
      let mang = [];
      await Promise.all(
          arayUserId.map(userId => {
              return db.collection('User')
                  .doc(userId)
                  .collection('Profile')
                  .get()
                  .then(snapshot => {
                      if (!snapshot.empty) {
                          snapshot.docs.forEach(doc => {
                              const user = doc.data();
                              // Thêm logic tìm kiếm
                              if (user.sdt?.toLowerCase().includes(search.toLowerCase())) {
                                  mang.push(user);
                              }
                          });
                      }
                  });
          })
      );

      // Phân trang
      const totalItems = mang.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      mang = mang.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

      // Render view và truyền dữ liệu
      res.render('nguoidung', {
        mang,
        totalPages,
        currentPage,
        itemsPerPage, // Thêm dòng này
        search,
    });
  } catch (error) {
      console.error("Lỗi khi lấy dữ liệu Firestore:", error);
      res.status(500).send("Lỗi khi lấy dữ liệu Firestore");
  }
});


module.exports = router;
