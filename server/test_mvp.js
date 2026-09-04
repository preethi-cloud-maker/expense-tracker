const API_URL = 'http://localhost:5000/api';

async function testMVP() {
  console.log('Testing MVP...');
  let token = '';
  let userId = '';
  let categoryId = '';
  let transactionId = '';

  try {
    // 1. Register new user
    console.log('1. Testing Registration...');
    const testEmail = `testuser_${Date.now()}@test.com`;
    let res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: testEmail, password: 'password123' })
    });
    if (!res.ok) throw new Error('Registration failed: ' + await res.text());
    let data = await res.json();
    token = data.token;
    userId = data.user.id;
    console.log('Registration successful. Token acquired.');

    // 2. Get Categories (to get a category ID for transaction)
    console.log('2. Fetching Categories...');
    res = await fetch(`${API_URL}/categories`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch categories: ' + await res.text());
    let categories = await res.json();
    categoryId = categories.find(c => c.type === 'expense').id;
    console.log(`Found category ID: ${categoryId}`);

    // 3. Create Transaction
    console.log('3. Creating Transaction...');
    res = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        type: 'expense',
        amount: 250,
        category_id: categoryId,
        description: 'Test CRUD transaction',
        payment_method: 'Cash',
        transaction_date: new Date().toISOString().split('T')[0]
      })
    });
    if (!res.ok) throw new Error('Failed to create transaction: ' + await res.text());
    data = await res.json();
    transactionId = data.id;
    console.log(`Transaction created. ID: ${transactionId}`);

    // 4. Update Transaction
    console.log('4. Updating Transaction...');
    res = await fetch(`${API_URL}/transactions/${transactionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        type: 'expense',
        amount: 350, // Updated amount
        category_id: categoryId,
        description: 'Updated CRUD transaction',
        payment_method: 'Card',
        transaction_date: new Date().toISOString().split('T')[0]
      })
    });
    if (!res.ok) throw new Error('Failed to update transaction: ' + await res.text());
    data = await res.json();
    if (data.amount !== '350.00') throw new Error('Amount not updated correctly.');
    console.log('Transaction updated successfully.');

    // 5. Delete Transaction
    console.log('5. Deleting Transaction...');
    res = await fetch(`${API_URL}/transactions/${transactionId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete transaction: ' + await res.text());
    console.log('Transaction deleted successfully.');

    console.log('--- ALL MVP TESTS PASSED ---');
  } catch (err) {
    console.error('TEST FAILED:', err.message);
  }
}

testMVP();
