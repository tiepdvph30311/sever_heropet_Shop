const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const app = express();
app.use(express.urlencoded({ extended: true }));

// Firebase Admin SDK initialization
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Set up EJS and static folder
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public', 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Home route
app.get('/home', (req, res) => {
  res.render('home');
});

// Login route
app.get('/', (req, res) => {
  res.render('login'); // Render login page
});

// Handle login form submission
// app.post('/login', async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     const userRef = db.collection('Admin').doc('MCkeaGWWWcdiresTisSJ'); 
//     const doc = await userRef.get();

//     if (!doc.exists) {
//       return res.status(400).send('Admin not found.');
//     }

//     const adminData = doc.data();
    
//     // Check if credentials match
//     if (adminData.username === username && adminData.pass === password) {
//       // Redirect to the protected page or homepage after successful login
//       res.redirect('/home');
//     } else {
//       res.status(401).send('Invalid username or password');
//     }
//   } catch (error) {
//     console.error('Error logging in:', error);
//     res.status(500).send('Internal server error');
//   }
// });
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const adminsRef = db.collection('Admin'); // Lấy collection Admin
    const snapshot = await adminsRef.get();   // Lấy tất cả documents trong collection

    if (snapshot.empty) {
      return res.status(400).send('No admins found.');
    }

    let found = false;

    // Duyệt qua các document trong collection
    snapshot.forEach(doc => {
      const adminData = doc.data();
      
      // Kiểm tra username và password khớp
      if (adminData.username === username && adminData.pass === password) {
        found = true;
        return res.redirect('/home');
      }
    });

    // Nếu không tìm thấy tài khoản khớp
    if (!found) {
      return res.render('login', { message: 'Đăng Nhập thất bại tài khoản hoặc mật khẩu không chình xác.' });
    }

  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Internal server error');
  }
});


// Protected route (only accessible after login)
app.get('/dashboard', (req, res) => {
  res.send('Welcome to the admin dashboard!'); // Customize this as needed
});

// Your other routes
const productRouter = require('./routes/productRoutes');
app.use('/product', productRouter);

const servicesRoutes = require('./routes/servicesRoutes');
app.use('/services', servicesRoutes);


const bookingsRouter = require('./routes/bookingsRouter');
app.use('/bookings', bookingsRouter);

const doanhthusRouter = require('./routes/doanhThuRoutes');
app.use('/doanhthu', doanhthusRouter);

// Start the server

const HoaDon = require('./routes/hoaDonRouter');
app.use('/HoaDon', HoaDon); 


const doanhthusp = require('./routes/doanhThuSProuter');
app.use('/doanhthusp', doanhthusp);


const notificationsRouter = require('./routes/notificationsRouter');
app.use('/notifications', notificationsRouter);




// Khởi động server

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
