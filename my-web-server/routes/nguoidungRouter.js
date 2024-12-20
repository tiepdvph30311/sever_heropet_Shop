const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

router.get('/', async (req, res) => {
    try {
        const userSnapshot = await db.collection('User').get(); // Lấy toàn bộ User
        const users = [];

        for (const userDoc of userSnapshot.docs) {
            const userId = userDoc.id; // ID tự động của User

            // Truy cập collection 'Profile' của từng User
            const profileSnapshot = await db.collection('User')
                .doc(userId)
                .collection('Profile')
                .limit(1) // Lấy document đầu tiên trong Profile
                .get();

            // Thêm dữ liệu Profile hoặc gán mặc định
            let profileData = {
                hoten: "Không xác định",
                avatar: "",
                gioitinh: "Không xác định",
                diachi: "Không xác định",
                ngaysinh: "Không xác định",
                sdt: "Không xác định",
            };

            if (!profileSnapshot.empty) {
                profileData = profileSnapshot.docs[0].data();
            }

            users.push({
                id: userId,
                ...profileData,
            });
        }

        // Render giao diện và truyền dữ liệu users
        res.render('nguoidung', { users });
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu Firestore:", error);
        res.status(500).send("Lỗi khi lấy dữ liệu Firestore");
    }
});

module.exports = router;
