const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Path harus mengarah ke folder 'routes' yang berada di level yang sama dengan server.js
const authRoutes = require('./routes/authRoutes'); 
const fileRoutes = require('./routes/fileRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

app.get('/', (req, res) => {
    res.send('Server OurCloud Berjalan!');
});

app.listen(3000, () => {
    console.log("Server JALAN di http://localhost:3000");
});