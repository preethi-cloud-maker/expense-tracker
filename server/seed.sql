USE spendwise;

-- Insert default user (password: 'password' hashed)
-- Note: bcrypt hash for 'password'
INSERT INTO users (name, email, password) VALUES 
('Demo User', 'demo@spendwise.com', '$2b$10$wE/.7h06C/X.X5w.rS3D/e9t4GXYD3J5c4wP.Vq0F3wO65yL5qMpq');

-- Store the user ID
SET @user_id = LAST_INSERT_ID();

-- Insert Categories
INSERT INTO categories (user_id, name, type) VALUES
(@user_id, 'Food', 'expense'),
(@user_id, 'Transport', 'expense'),
(@user_id, 'Shopping', 'expense'),
(@user_id, 'Bills', 'expense'),
(@user_id, 'Entertainment', 'expense'),
(@user_id, 'Healthcare', 'expense'),
(@user_id, 'Education', 'expense'),
(@user_id, 'Other', 'expense'),
(@user_id, 'Salary', 'income'),
(@user_id, 'Freelance', 'income'),
(@user_id, 'Business', 'income'),
(@user_id, 'Investment', 'income'),
(@user_id, 'Other Income', 'income');

-- Insert Transactions
INSERT INTO transactions (user_id, category_id, type, amount, description, payment_method, transaction_date) VALUES
(@user_id, (SELECT id FROM categories WHERE name='Salary' AND user_id=@user_id), 'income', 50000, 'September Salary', 'Bank Transfer', CURDATE() - INTERVAL 10 DAY),
(@user_id, (SELECT id FROM categories WHERE name='Food' AND user_id=@user_id), 'expense', 1500, 'Groceries', 'Card', CURDATE() - INTERVAL 8 DAY),
(@user_id, (SELECT id FROM categories WHERE name='Food' AND user_id=@user_id), 'expense', 400, 'Restaurant', 'Cash', CURDATE() - INTERVAL 7 DAY),
(@user_id, (SELECT id FROM categories WHERE name='Transport' AND user_id=@user_id), 'expense', 1200, 'Fuel', 'Card', CURDATE() - INTERVAL 5 DAY),
(@user_id, (SELECT id FROM categories WHERE name='Bills' AND user_id=@user_id), 'expense', 3000, 'Electricity Bill', 'Card', CURDATE() - INTERVAL 4 DAY),
(@user_id, (SELECT id FROM categories WHERE name='Shopping' AND user_id=@user_id), 'expense', 2500, 'New Shoes', 'Card', CURDATE() - INTERVAL 2 DAY),
(@user_id, (SELECT id FROM categories WHERE name='Entertainment' AND user_id=@user_id), 'expense', 800, 'Movie Tickets', 'Cash', CURDATE() - INTERVAL 1 DAY);

-- Insert Budgets (Current Month)
INSERT INTO budgets (user_id, category_id, amount, month, year) VALUES
(@user_id, (SELECT id FROM categories WHERE name='Food' AND user_id=@user_id), 5000, MONTH(CURDATE()), YEAR(CURDATE())),
(@user_id, (SELECT id FROM categories WHERE name='Transport' AND user_id=@user_id), 3000, MONTH(CURDATE()), YEAR(CURDATE())),
(@user_id, (SELECT id FROM categories WHERE name='Shopping' AND user_id=@user_id), 2000, MONTH(CURDATE()), YEAR(CURDATE())),
(@user_id, (SELECT id FROM categories WHERE name='Entertainment' AND user_id=@user_id), 1500, MONTH(CURDATE()), YEAR(CURDATE()));
