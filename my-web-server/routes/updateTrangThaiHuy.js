const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const snapshot = await db.collection('CTHDBooking').doc(id).get();
        if (!snapshot.exists) {
            return res.status(404).send('Booking not found');
        }

        const booking = snapshot.data();
        res.render('updateTrangThaiHuy', {
            booking: { id: snapshot.id, ...booking }
        });
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).send('Error fetching booking');
    }
});

// Route xử lý cập nhật trangThaiHuy
router.post('/:id', async (req, res) => {
    const { id } = req.params;
    const { trangThaiHuy } = req.body;

    try {
        await db.collection('CTHDBooking').doc(id).update({
            trangThaiHuy: trangThaiHuy === 'true'
        });

        res.redirect('/bookingshuy');
    } catch (error) {
        console.error('Error updating trangThaiHuy:', error);
        res.status(500).send('Error updating trangThaiHuy');
    }
});

module.exports = router;
