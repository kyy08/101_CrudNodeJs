// Mengimpor library dan modul yang diperlukan
const express = require('express');  // Framework Express untuk membuat server HTTP
const todoRoutes = require('./routes/tododb.js');  // Rute untuk CRUD todo
const app = express();  // Membuat instance aplikasi Express
require('dotenv').config();  // Untuk mengimpor variabel lingkungan (environment variables) dari file .env
const port = process.env.PORT || 3000;  // Menentukan port server, default ke 3000

const expressLayout = require('express-ejs-layouts');  // Modul untuk menggunakan layout dengan EJS
const db = require('./database/db.js');  // Mengimpor konfigurasi database

// Mengimpor session dan middleware otentikasi
const session = require('express-session');  // Middleware untuk session
const authRoutes = require('./routes/authRoutes');  // Rute untuk otentikasi (login/logout)
const { isAuthenticated } = require('./Middlewares/Middleware.js');  // Middleware untuk memeriksa apakah pengguna sudah login

// Menyediakan folder static (public) untuk file seperti gambar, CSS, JS
app.use(express.static('public'));

// Menggunakan express-ejs-layouts untuk mendukung layout EJS
app.use(expressLayout);

// Menggunakan middleware untuk parsing JSON request
app.use(express.json());

// Konfigurasi express-session untuk menangani session
app.use(session({
    secret: process.env.SESSION_SECRET,  // Menggunakan secret dari file .env
    resave: false,  // Tidak menyimpan session yang tidak berubah
    saveUninitialized: false,  // Tidak menyimpan session yang belum diinisialisasi
    cookie: { secure: false }  // Set cookie secure ke true jika menggunakan HTTPS
}));

// Rute untuk todo
app.use('/todos', todoRoutes);  // Menangani rute /todos menggunakan todoRoutes

// Menentukan view engine EJS untuk tampilan
app.set('view engine', 'ejs');

// Halaman utama, hanya bisa diakses jika pengguna sudah terautentikasi
app.get('/', isAuthenticated, (req, res) => {
    res.render('index', {  // Menampilkan view index.ejs dengan layout main-layout
        layout: 'layouts/main-layouts.ejs'
    });
});

// Menangani URL encoded dari form
app.use(express.urlencoded({ extended: true }));

// Rute untuk otentikasi (login/logout)
app.use('/', authRoutes);

// Halaman kontak, hanya bisa diakses jika pengguna sudah terautentikasi
app.get('/contact', isAuthenticated, (req, res) => {
    res.render('contact', {
        layout: 'layouts/main-layouts.ejs'
    });
});

// Rute untuk halaman index, hanya bisa diakses jika pengguna sudah terautentikasi
app.get('/index', isAuthenticated, (req, res) => {
    res.render('index', {
        layout: 'layouts/main-layouts.ejs'
    });
});

// Rute untuk logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {  // Menghancurkan session saat logout
        if (err) {
            console.error("Error saat logout:", err);
            return res.status(500).send("Error saat logout");
        }
        res.redirect('/login');  // Redirect ke halaman login setelah logout
    });
});

// Menampilkan daftar todos dari database
app.get('/todo-view', (req, res) => {
    db.query('SELECT * FROM todos', (err, todos) => {  // Query untuk mendapatkan todos dari database
        if (err) return res.status(500).send('Internal Server Error');
        res.render('todo', {  // Menampilkan view todo.ejs dengan layout
            layout: 'layouts/main-layouts.ejs',
            todos: todos  // Mengirimkan data todos ke tampilan
        });
    });
});

// Menangani error 404 untuk halaman yang tidak ditemukan
app.use((req, res) => {
    res.status(404).send('404 - Page Not Found');
});

// Menjalankan server pada port yang telah ditentukan
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});