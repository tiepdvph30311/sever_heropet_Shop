const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

router.get('/', async (req, res) => {
    try {

        const snapshot = await db.collection('IDUser')
            .get();

        const bookings = snapshot.docs.map(doc => doc.data());
        let arayUserId = []
        bookings.forEach(doc => {
            arayUserId.push(doc.iduser)
        });

        // const userSnapshot = await db.collection('User').get(); // Get all users
        // const users = await Promise.all(userSnapshot.docs.map(async (userDoc) => {
        //     const userId = userDoc.id; // User document ID


        //     // Fetch the first document in the Profile subcollection
        //     const profileSnapshot = await db.collection('User')
        //         .doc(arayUserId)
        //         .collection('Profile')
        //         .limit(1) // Fetch only the first document
        //         .get();

        //     let profileData = {
        //         hoten: "Không xác định",
        //         avatar: "",
        //         gioitinh: "Không xác định",
        //         diachi: "Không xác định",
        //         ngaysinh: "Không xác định",
        //         sdt: "Không xác định",
        //     };

        //     if (!profileSnapshot.empty) {
        //         profileData = profileSnapshot.docs[0].data();
        //     }

        //     return {
        //         id: userId,
        //         ...profileData,
        //     };
        // }));


        let mang=[]
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
                    // console.log(doc.id, '=>', doc.data());
                    mang.push(doc.data())
                  });
                }
              });
          }))
          .then(() => {
            console.log('All user profiles have been fetched.');
          })
          .catch(err => {
            console.error('Error fetching user profiles:', err);
          });
console.log(mang);

        // Render view and pass user data
        res.render('nguoidung', { mang });
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu Firestore:", error);
        res.status(500).send("Lỗi khi lấy dữ liệu Firestore");
    }
});

module.exports = router;
