const express = require('express');
const cors = require('cors');
require('dotenv').config();

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const app = express();

app.use(cors());
app.use(express.json());

// Health check route for Railway
app.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running' });
});

app.get('/api/debug', async (req, res) => {
  try {
    const [tables] = await require('./config/db').query('SHOW TABLES');
    let users = [];
    if (tables.some(t => Object.values(t)[0] === 'users')) {
      const [u] = await require('./config/db').query('SELECT id, name, email FROM users');
      users = u;
    }
    res.json({ db_connected: true, tables, users, jwt_secret_set: !!process.env.JWT_SECRET });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

const db = require('./config/db');

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  db.query('SELECT 1')
    .then(() => console.log('Database connected successfully'))
    .catch((err) => console.error('Database connection failed:', err.message));
});
