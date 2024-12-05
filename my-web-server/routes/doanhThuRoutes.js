const express = require('express');
const router = express.Router();
const admin = require('firebase-admin'); // Đảm bảo đã cài firebase-admin
const db = admin.firestore();
const moment = require('moment'); // Đảm bảo đã cài moment
// Hiển thị trang thống kê doanh thu
router.get('/doanhthu', (req, res) => {
    res.render('doanhThu', { totalRevenue: 0, startDate: '', endDate: '' });
});

// Thống kê doanh thu theo mốc thời gian
router.post('/doanhthu', async (req, res) => {
    const { startDate, endDate } = req.body;

    const start = moment(startDate).startOf('day');
    const end = moment(endDate).endOf('day');

    try {
        const query = db.collection('CTHDBooking')
            .where('trangThai', '==', 'Đã xác nhận')
            .where('thoiGianDatLich', '>=', start.toDate())
            .where('thoiGianDatLich', '<=', end.toDate());

        const snapshot = await query.get();

        let totalRevenue = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            totalRevenue += data.giaDichVu;
        });

        // Trả kết quả ra giao diện
        res.render('doanhThu', { totalRevenue, startDate, endDate });
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu doanh thu:', error);
        res.status(500).send('Có lỗi xảy ra khi lấy dữ liệu doanh thu.');
    }
});


module.exports = router;
