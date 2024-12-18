const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Đường dẫn đến danh sách bookings
// router.get('/', async (req, res) => {
//     try {
//         const snapshot = await db.collection('CTHDBooking').get();
//         const bookings = snapshot.docs.map(doc => doc.data());
//         res.render('bookings', { bookings });
//     } catch (error) {
//         console.error("Lỗi khi tải danh sách bookings:", error);
//         res.status(500).send('Lỗi khi tải danh sách bookings');
//     }
// });
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Trang hiện tại, mặc định là 1
        const pageSize = 10; // Số lượng phần tử trên mỗi trang

        const startAt = (page - 1) * pageSize;

        // Lấy danh sách booking có phân trang
        const snapshot = await db.collection('CTHDBooking')
            .orderBy('thoiGianDatLich') // Sắp xếp theo thời gian đặt lịch
            .offset(startAt)
            .limit(pageSize)
            .get();

        const bookings = snapshot.docs.map(doc => doc.data());

        // Tính tổng số lượng bản ghi
        const totalSnapshot = await db.collection('CTHDBooking').get();
        const totalRecords = totalSnapshot.size;
        const totalPages = Math.ceil(totalRecords / pageSize);

        // Truyền biến sang EJS
        res.render('bookings', {
            bookings,
            currentPage: page,
            totalPages: totalPages
        });
    } catch (error) {
        console.error("Lỗi khi tải danh sách bookings:", error);
        res.status(500).send('Lỗi khi tải danh sách bookings');
    }
});

// Sửa booking
router.get('/editBooking/:idcthdbooking', async (req, res) => {
    const { idcthdbooking } = req.params;
    try {
        const snapshot = await db.collection('CTHDBooking').where('idcthdbooking', '==', idcthdbooking).get();
        if (snapshot.empty) {
            return res.status(404).send('Booking không tìm thấy');
        }
        const booking = snapshot.docs[0].data();
        const doccthd = await db.collection('User')
            .doc(booking.iduser)  // Document chứa subcollection ALL
            .collection('Profile')
            .get()

            
        const bookinguid = doccthd.docs[0].data();
        
        console.log(bookinguid);

        res.render('editBooking', { booking }); // Gửi thông tin booking để hiển thị lên form sửa
    } catch (error) {
        console.error("Lỗi khi sửa booking:", error);
        res.status(500).send('Lỗi khi sửa booking');
    }
});

router.post('/editBooking/:idcthdbooking', async (req, res) => {
    const { idcthdbooking } = req.params;
    const { trangThai } = req.body; // Chỉ cho phép sửa trường trạng thái
    try {
        const snapshot = await db.collection('CTHDBooking').where('idcthdbooking', '==', idcthdbooking).get();
        if (snapshot.empty) {
            return res.status(404).send('Booking không tìm thấy');
        }
        const docId = snapshot.docs[0].id;


        // Cập nhật trạng thái
        await db.collection('CTHDBooking').doc(docId).update({
            trangThai // Chỉ cập nhật trường trạng thái
        });

        // Nếu trạng thái mới là "Hoàn thành", thêm thông báo cho admin
        if (trangThai === 'Hoàn thành') {
            const notification = {
                message: `Booking ${idcthdbooking} Đã hoàn thành .`,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            };
            await db.collection('Notifications').add(notification);  // Lưu thông báo vào Firestore
        }

        res.redirect('/bookings'); // Quay lại danh sách booking sau khi sửa
    } catch (error) {
        console.error("Lỗi khi cập nhật booking:", error);
        res.status(500).send('Lỗi khi cập nhật booking');
    }
});

// Xóa booking
router.get('/deleteBooking/:idcthdbooking', async (req, res) => {
    const { idcthdbooking } = req.params;
    try {
        const snapshot = await db.collection('CTHDBooking').where('idcthdbooking', '==', idcthdbooking).get();
        if (snapshot.empty) {
            return res.status(404).send('Booking không tìm thấy');
        }
        const docId = snapshot.docs[0].id;
        await db.collection('CTHDBooking').doc(docId).delete();
        res.redirect('/bookings'); // Quay lại danh sách booking sau khi xóa
    } catch (error) {
        console.error("Lỗi khi xóa booking:", error);
        res.status(500).send('Lỗi khi xóa booking');
    }
});

module.exports = router;
