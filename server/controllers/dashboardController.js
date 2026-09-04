const db = require('../config/db');

exports.getSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [[totalIncome]] = await db.query("SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND type = 'income'", [userId]);
    const [[totalExpense]] = await db.query("SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND type = 'expense'", [userId]);
    const [[currentMonthExpense]] = await db.query("SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND type = 'expense' AND MONTH(transaction_date) = ? AND YEAR(transaction_date) = ?", [userId, currentMonth, currentYear]);

    const [recentTransactions] = await db.query(`
      SELECT t.*, c.name as category_name 
      FROM transactions t 
      JOIN categories c ON t.category_id = c.id 
      WHERE t.user_id = ? 
      ORDER BY t.transaction_date DESC, t.created_at DESC LIMIT 5
    `, [userId]);

    res.json({
      totalBalance: (totalIncome.total || 0) - (totalExpense.total || 0),
      totalIncome: totalIncome.total || 0,
      totalExpenses: totalExpense.total || 0,
      currentMonthExpenses: currentMonthExpense.total || 0,
      recentTransactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMonthly = async (req, res) => {
  try {
    // Get last 6 months income vs expense
    const query = `
      SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE user_id = ? AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
      ORDER BY month ASC
    `;
    const [data] = await db.query(query, [req.user.id]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const query = `
      SELECT c.name, SUM(t.amount) as value
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ? AND t.type = 'expense' AND MONTH(t.transaction_date) = ? AND YEAR(t.transaction_date) = ?
      GROUP BY c.name
    `;
    const [data] = await db.query(query, [req.user.id, currentMonth, currentYear]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
