const express = require('express'); // Mengimpor Express untuk membuat aplikasi web
const router = express.Router(); // Membuat router untuk mengatur rute-rute

// Array untuk menyimpan data Todo (sementara di-memory)
let todos = [
    {
        id: 1, task: 'Belajar Node.js', completed: false
    },
    {
        id: 2, task: 'Membuat API', completed: false
    },
];

// Endpoint untuk mendapatkan daftar Todos
router.get('/', (req, res) => {
    // Mengirimkan seluruh daftar todo sebagai respon dalam format JSON
    res.json(todos);
});

// Endpoint untuk menambahkan Todo baru
router.post('/', (req, res) => {
    const newTodo = {
        id: todos.length + 1, // Menentukan ID baru berdasarkan panjang array
        task: req.body.task, // Mengambil task dari body request
        completed: false // Set default status 'completed' sebagai false
    };
    todos.push(newTodo); // Menambahkan todo baru ke array todos
    res.status(201).json(newTodo); // Mengirimkan respon dengan status 201 (created) dan data todo yang baru
});

// Endpoint untuk menghapus Todo berdasarkan ID
router.delete('/:id', (req, res) => {
    // Mencari index todo berdasarkan ID yang diterima di parameter URL
    const todoIndex = todos.findIndex(t => t.id === parseInt(req.params.id));
    
    // Jika todo tidak ditemukan, kirimkan error 404
    if (todoIndex === -1) return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    
    // Menghapus todo dari array dan menyimpan todo yang dihapus
    const deletedTodo = todos.splice(todoIndex, 1)[0];
    
    // Mengirimkan respon dengan pesan bahwa todo telah dihapus
    res.status(200).json({ message: `Tugas '${deletedTodo.task}' telah dihapus` });
});

// Endpoint untuk memperbarui Todo berdasarkan ID
router.put('/:id', (req, res) => {
    // Mencari todo berdasarkan ID yang diterima di parameter URL
    const todo = todos.find(t => t.id === parseInt(req.params.id));
    
    // Jika todo tidak ditemukan, kirimkan error 404
    if (!todo) return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    
    // Memperbarui task jika ada data yang dikirimkan di body request
    todo.task = req.body.task || todo.task; 
    
    // Mengirimkan respon dengan pesan bahwa todo telah diperbarui
    res.status(200).json({
        message: `Tugas dengan ID ${todo.id} telah diperbarui`,
        updatedTodo: todo
    });
});

// Mengekspor router untuk digunakan di file lain
module.exports = router;