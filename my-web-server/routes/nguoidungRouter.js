const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

router.get('/', async (req, res) => {
    try {
        const userSnapshot = await db.collection('User').get(); // Get all users
        const users = await Promise.all(userSnapshot.docs.map(async (userDoc) => {
            const userId = userDoc.id; // User document ID
            
            // Fetch the first document in the Profile subcollection
            const profileSnapshot = await db.collection('User')
                .doc(userId)
                .collection('Profile')
                .limit(1) // Fetch only the first document
                .get();

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

            return {
                id: userId,
                ...profileData,
            };
        }));

        // Render view and pass user data
        res.render('nguoidung', { users });
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu Firestore:", error);
        res.status(500).send("Lỗi khi lấy dữ liệu Firestore");
    }
});

module.exports = router;
