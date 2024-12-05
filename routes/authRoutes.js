const express = require('express'); // Mengimpor Express untuk membuat aplikasi web
const bcrypt = require('bcryptjs'); // Mengimpor bcryptjs untuk mengenkripsi password
const db = require('../database/db'); // Mengimpor koneksi ke database
const router = express.Router(); // Membuat router untuk mengatur rute-rute

// Rute POST untuk registrasi pengguna
router.post('/signup', (req, res) => {
    const { username, password } = req.body; // Mengambil username dan password dari form

    // Enkripsi password dengan bcrypt
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).send('Error hashing password'); // Menangani error jika enkripsi gagal

        // Menyimpan data pengguna baru ke database
        db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], (err, result) => {
            if (err) return res.status(500).send('Error registering user'); // Menangani error saat penyimpanan ke database
            res.redirect('/login'); // Jika berhasil, arahkan ke halaman login
        });
    });
});

// Rute GET untuk menampilkan form signup
router.get('/signup', (req, res) => {
    res.render('signup', {
        layout: 'layouts/main-layouts' // Menampilkan form registrasi menggunakan layout tertentu
    });
});

// Rute POST untuk login
router.post('/login', (req, res) => {
    const { username, password } = req.body; // Mengambil username dan password dari form

    // Mencari pengguna berdasarkan username di database
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).send('Error fetching user'); // Menangani error saat mengambil data pengguna
        if (results.length === 0) return res.status(400).send('User not found'); // Jika pengguna tidak ditemukan

        // Membandingkan password yang dimasukkan dengan password yang ada di database
        bcrypt.compare(password, results[0].password, (err, isMatch) => {
            if (err) return res.status(500).send('Error checking password'); // Menangani error saat membandingkan password
            if (!isMatch) return res.status(401).send('Incorrect password'); // Jika password tidak cocok

            // Jika login berhasil, simpan userId dalam sesi dan arahkan ke halaman utama
            req.session.userId = results[0].id;
            res.redirect('/'); // Arahkan ke halaman utama setelah login
        });
    });
});

// Rute GET untuk menampilkan form login
router.get('/login', (req, res) => {
    res.render('login', {
        layout: 'layouts/main-layouts' // Menampilkan form login dengan layout tertentu
    });
});

// Rute POST untuk logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).send('Error logging out'); // Menangani error saat logout
        res.redirect('/login'); // Setelah logout, arahkan ke halaman login
    });
});

// Mengekspor router untuk digunakan di file lain
module.exports = router;