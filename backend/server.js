const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes'); 
const fileRoutes = require('./routes/fileRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

app.listen(3000, () => {
    console.log("Server JALAN di http://localhost:3000");
});