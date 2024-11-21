const express = require('express');
const db = require('./firebaseConfig'); // Cấu hình Firebase
const app = express();

// Middleware để parse JSON body
app.use(express.json());

// API route để thêm user vào Firebase
app.post('/users', (req, res) => {
    const { id, username, age } = req.body;

    // Lưu thông tin người dùng vào Firebase
    const ref = db.ref('users/' + id);
    ref.set({
        username: username,
        age: age
    }).then(() => {
        res.status(201).send({ message: 'User added successfully' });
    }).catch((error) => {
        res.status(500).send({ message: 'Error adding user', error: error });
    });
});

// API route để lấy danh sách người dùng từ Firebase
app.get('/users', (req, res) => {
    const ref = db.ref('users');
    ref.once('value', (snapshot) => {
        const users = snapshot.val();
        if (users) {
            res.status(200).json(Object.values(users)); // Trả về danh sách người dùng
        } else {
            res.status(404).send('No users found');
        }
    });
});

// Bắt lỗi API
app.use((req, res) => {
    res.status(404).send('API not found');
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
