const express = require('express'); // Mengimpor Express untuk membuat aplikasi web
const router = express.Router(); // Membuat router untuk menangani rute-rute
const db = require('../database/db'); // Mengimpor koneksi ke database MySQL

// Endpoint untuk mendapatkan semua tugas (GET /)
router.get('/', (req, res) => {
    db.query('SELECT * FROM todos', (err, results) => {
        if (err) return res.status(500).send('Internal Server Error'); // Menangani error jika query gagal
        res.json(results); // Mengirimkan hasil query (semua tugas) dalam format JSON
    });
});

// Endpoint untuk mendapatkan tugas berdasarkan ID (GET /:id)
router.get('/:id', (req, res) => {
    db.query('SELECT * FROM todos WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error'); // Menangani error jika query gagal
        if (results.length === 0) return res.status(404).send('Tugas tidak ditemukan'); // Jika tidak ada tugas dengan ID yang diberikan
        res.json(results[0]); // Mengirimkan data tugas dengan ID yang ditemukan
    });
});

// Endpoint untuk menambahkan tugas baru (POST /)
router.post('/', (req, res) => {
    const { task } = req.body; // Mengambil data task dari body request
    // Mengecek jika task kosong atau hanya berisi spasi
    if (!task || task.trim() === '') {
        return res.status(400).send('Tugas tidak boleh kosong'); // Mengirimkan error jika task kosong
    }
    // Menyimpan tugas baru ke database
    db.query('INSERT INTO todos (task) VALUES (?)', [task.trim()], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error'); // Menangani error jika query gagal
        const newTodo = { id: results.insertId, task: task.trim(), completed: false }; // Membuat objek tugas baru
        res.status(201).json(newTodo); // Mengirimkan respon dengan status 201 (created) dan data tugas baru
    });
});

// Endpoint untuk memperbarui tugas berdasarkan ID (PUT /:id)
router.put('/:id', (req, res) => {
    const { task, completed } = req.body; // Mengambil data task dan completed dari body request
    // Mengupdate data tugas berdasarkan ID
    db.query('UPDATE todos SET task = ?, completed = ? WHERE id = ?', [task, completed, req.params.id], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error'); // Menangani error jika query gagal
        if (results.affectedRows === 0) return res.status(404).send('Tugas tidak ditemukan'); // Jika tidak ada tugas dengan ID yang diberikan
        res.json({ id: req.params.id, task, completed }); // Mengirimkan data tugas yang telah diperbarui
    });
});

// Endpoint untuk menghapus tugas berdasarkan ID (DELETE /:id)
router.delete('/:id', (req, res) => {
    // Menghapus tugas berdasarkan ID
    db.query('DELETE FROM todos WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error'); // Menangani error jika query gagal
        if (results.affectedRows === 0) return res.status(404).send('Tugas tidak ditemukan'); // Jika tidak ada tugas dengan ID yang diberikan
        res.status(204).send(); // Mengirimkan status 204 (No Content) sebagai respon sukses
    });
});

// Mengekspor router ini agar bisa digunakan di file lain
module.exports = router;