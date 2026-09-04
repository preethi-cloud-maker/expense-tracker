const db = require('../config/db');

exports.getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let query = `
      SELECT b.*, c.name as category_name, 
             IFNULL((SELECT SUM(amount) FROM transactions t WHERE t.category_id = b.category_id AND t.user_id = b.user_id AND MONTH(t.transaction_date) = b.month AND YEAR(t.transaction_date) = b.year), 0) as spent
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = ?
    `;
    const params = [req.user.id];
    
    if (month && year) {
      query += ` AND b.month = ? AND b.year = ?`;
      params.push(month, year);
    }

    const [budgets] = await db.query(query, params);
    res.json(budgets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createBudget = async (req, res) => {
  try {
    const { category_id, amount, month, year } = req.body;
    
    // Check if budget already exists for this category/month/year
    const [existing] = await db.query('SELECT id FROM budgets WHERE user_id = ? AND category_id = ? AND month = ? AND year = ?', [req.user.id, category_id, month, year]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Budget already exists for this category in the specified month and year' });
    }

    const [result] = await db.query(
      'INSERT INTO budgets (user_id, category_id, amount, month, year) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, category_id, amount, month, year]
    );

    const [newBudget] = await db.query('SELECT b.*, c.name as category_name, 0 as spent FROM budgets b JOIN categories c ON b.category_id = c.id WHERE b.id = ?', [result.insertId]);
    res.status(201).json(newBudget[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const { amount } = req.body;
    await db.query('UPDATE budgets SET amount = ? WHERE id = ? AND user_id = ?', [amount, req.params.id, req.user.id]);
    
    const [updated] = await db.query(`
      SELECT b.*, c.name as category_name, 
             IFNULL((SELECT SUM(t.amount) FROM transactions t WHERE t.category_id = b.category_id AND t.user_id = b.user_id AND MONTH(t.transaction_date) = b.month AND YEAR(t.transaction_date) = b.year), 0) as spent
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.id = ?
    `, [req.params.id]);
    
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    await db.query('DELETE FROM budgets WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
