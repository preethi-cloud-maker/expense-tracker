const API_URL = 'http://localhost:5000/api';

async function runTests() {
  let token = '';

  try {
    console.log('1. Testing /api/auth/register...');
    const testEmail = `auth_test_${Date.now()}@test.com`;
    let res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Auth Test User', email: testEmail, password: 'password123' })
    });
    if (!res.ok) throw new Error('Registration failed: ' + await res.text());
    let data = await res.json();
    console.log('✅ Registration successful. User created.');

    console.log('\n2. Testing /api/auth/login...');
    res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'password123' })
    });
    if (!res.ok) throw new Error('Login failed: ' + await res.text());
    data = await res.json();
    token = data.token;
    
    if (token) {
      console.log('✅ Login successful.');
      console.log('✅ JWT is returned successfully.');
    } else {
      throw new Error('No token returned on login');
    }

    console.log('\n3. Testing /api/auth/me...');
    res = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Auth /me failed: ' + await res.text());
    data = await res.json();
    console.log(`✅ /api/auth/me successful. Authenticated as: ${data.name} (${data.email})`);

    console.log('\n--- ALL AUTHENTICATION TESTS PASSED ---');
  } catch (err) {
    console.error('❌ TEST FAILED:', err.message);
    process.exit(1);
  }
}

runTests();
