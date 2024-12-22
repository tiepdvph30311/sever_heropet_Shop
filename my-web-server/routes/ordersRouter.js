const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

router.get('/', async (req, res) => {
    try {
        const { iduser } = req.query; // Lấy iduser từ query string

        if (!iduser) {
            return res.status(400).send('Thiếu ID người dùng');
        }

        // Truy vấn danh sách đơn hàng của người dùng
        const orderSnapshot = await db.collection('CTHDBooking')
            .where('iduser', '==', iduser)
            .get();

        let orders = [];
        if (!orderSnapshot.empty) {
            orders = orderSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id, // ID đơn hàng
                    ...data,
                    thoiGianDatLich: data.thoiGianDatLich ? data.thoiGianDatLich.toDate() : null, // Chuyển đổi Timestamp sang Date
                };
            });
        }

        // Hiển thị danh sách đơn hàng
        res.render('orders', { orders });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách đơn hàng:', error);
        res.status(500).send('Lỗi khi lấy danh sách đơn hàng');
    }
});

module.exports = router;
