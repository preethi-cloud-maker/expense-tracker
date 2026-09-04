const db = require('../config/db');

exports.getTransactions = async (req, res) => {
  try {
    let query = `
      SELECT t.*, c.name as category_name 
      FROM transactions t 
      JOIN categories c ON t.category_id = c.id 
      WHERE t.user_id = ?
    `;
    const params = [req.user.id];

    // Apply filters if any
    const { type, category_id, search, sort } = req.query;
    if (type) {
      query += ` AND t.type = ?`;
      params.push(type);
    }
    if (category_id) {
      query += ` AND t.category_id = ?`;
      params.push(category_id);
    }
    if (search) {
      query += ` AND t.description LIKE ?`;
      params.push(`%${search}%`);
    }

    if (sort === 'amount_asc') {
      query += ` ORDER BY t.amount ASC`;
    } else if (sort === 'amount_desc') {
      query += ` ORDER BY t.amount DESC`;
    } else if (sort === 'date_asc') {
      query += ` ORDER BY t.transaction_date ASC, t.created_at ASC`;
    } else {
      query += ` ORDER BY t.transaction_date DESC, t.created_at DESC`;
    }

    const [transactions] = await db.query(query, params);
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const [transactions] = await db.query('SELECT * FROM transactions WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (transactions.length === 0) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transactions[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { category_id, type, amount, description, payment_method, transaction_date } = req.body;
    
    // Validate category ownership
    const [category] = await db.query('SELECT id FROM categories WHERE id = ? AND user_id = ?', [category_id, req.user.id]);
    if (category.length === 0) return res.status(400).json({ message: 'Invalid category' });

    const [result] = await db.query(
      'INSERT INTO transactions (user_id, category_id, type, amount, description, payment_method, transaction_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, category_id, type, amount, description, payment_method, transaction_date]
    );

    const [newTransaction] = await db.query('SELECT t.*, c.name as category_name FROM transactions t JOIN categories c ON t.category_id = c.id WHERE t.id = ?', [result.insertId]);
    res.status(201).json(newTransaction[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { category_id, type, amount, description, payment_method, transaction_date } = req.body;
    
    await db.query(
      'UPDATE transactions SET category_id = ?, type = ?, amount = ?, description = ?, payment_method = ?, transaction_date = ? WHERE id = ? AND user_id = ?',
      [category_id, type, amount, description, payment_method, transaction_date, req.params.id, req.user.id]
    );

    const [updatedTransaction] = await db.query('SELECT t.*, c.name as category_name FROM transactions t JOIN categories c ON t.category_id = c.id WHERE t.id = ?', [req.params.id]);
    res.json(updatedTransaction[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM transactions WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
