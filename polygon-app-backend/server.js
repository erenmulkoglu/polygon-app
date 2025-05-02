const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

dotenv.config();

const app = express();

// Veritabanına bağlan
connectDB();

// Middleware
app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/polygons', require('./src/routes/polygon.routes'));
app.use('/api/users', require('./src/routes/user.routes'));


app.get('/test', (_, res) => res.json({ message: 'Bağlantı başarılı!' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server çalışıyor: ${PORT}`));
