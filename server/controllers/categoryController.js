const db = require('../config/db');

exports.getCategories = async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories WHERE user_id = ? ORDER BY type, name', [req.user.id]);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;
    const [result] = await db.query('INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)', [req.user.id, name, type]);
    const [newCategory] = await db.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    res.status(201).json(newCategory[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, type } = req.body;
    await db.query('UPDATE categories SET name = ?, type = ? WHERE id = ? AND user_id = ?', [name, type, req.params.id, req.user.id]);
    const [updatedCategory] = await db.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    res.json(updatedCategory[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    // Check if category is used in transactions
    const [transactions] = await db.query('SELECT id FROM transactions WHERE category_id = ? AND user_id = ? LIMIT 1', [req.params.id, req.user.id]);
    if (transactions.length > 0) {
      return res.status(400).json({ message: 'Cannot delete category because it is used in transactions' });
    }
    
    await db.query('DELETE FROM categories WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
