const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Lấy danh sách người dùng
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('IDUser').get();
        const bookings = snapshot.docs.map(doc => doc.data());
        let arayUserId = [];

        bookings.forEach(doc => {
            arayUserId.push(doc.iduser);
        });

        let mang = [];
        await Promise.all(arayUserId.map(userId => {
            return db.collection('User')
                .doc(userId)
                .collection('Profile')
                .get()
                .then(snapshot => {
                    if (snapshot.empty) {
                        console.log('No documents found for user:', userId);
                    } else {
                        snapshot.docs.forEach(doc => {
                            mang.push({
                                id: userId, // Thêm iduser để sử dụng trong giao diện
                                ...doc.data()
                            });
                        });
                    }
                });
        })).catch(err => {
            console.error('Error fetching user profiles:', err);
        });

        // Render view và truyền dữ liệu người dùng
        res.render('nguoidung', { mang });
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu Firestore:", error);
        res.status(500).send("Lỗi khi lấy dữ liệu Firestore");
    }
});

// Lấy danh sách đơn hàng theo ID người dùng
router.get('/orders', async (req, res) => {
    try {
        const { iduser } = req.query; // Lấy iduser từ query string

        if (!iduser) {
            return res.status(400).send("Thiếu ID người dùng");
        }

        const orderSnapshot = await db.collection('CTHDBooking')
            .where('iduser', '==', iduser)
            .get();

        let orders = [];
        if (!orderSnapshot.empty) {
            orders = orderSnapshot.docs.map(doc => ({
                id: doc.id, // Thêm ID đơn hàng
                ...doc.data()
            }));
        }

        // Render view danh sách đơn hàng
        res.render('orders', { orders });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách đơn hàng:", error);
        res.status(500).send("Lỗi khi lấy danh sách đơn hàng");
    }
});

module.exports = router;
