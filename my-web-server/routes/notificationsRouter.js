const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Route hiển thị danh sách thông báo
router.get('/', async (req, res) => {
    try {
        // Truy vấn danh sách thông báo và sắp xếp theo thời gian giảm dần
        const snapshot = await db.collection('Notifications')
            .orderBy('createdAt', 'desc') // Sắp xếp theo `createdAt` giảm dần
            .get();

        // Xử lý dữ liệu và định dạng thời gian từ Timestamp
        const notifications = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                message: data.message || "No message",
                createdAt: data.createdAt 
                    ? data.createdAt.toDate().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
                    : "N/A"  // Nếu thiếu thời gian
            };
        });

        // Render ra file EJS với danh sách thông báo
        res.render('notifications', { notifications });
    } catch (error) {
        console.error("Lỗi khi tải danh sách thông báo:", error);
        res.status(500).send('Lỗi khi tải danh sách thông báo');
    }
});

module.exports = router;
