const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDb() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('Connected to MySQL...');

    const dbSql = fs.readFileSync(path.join(__dirname, 'database.sql')).toString();
    await connection.query(dbSql);
    console.log('Database and tables created.');

    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql')).toString();
    await connection.query(seedSql);
    console.log('Seed data inserted.');

    await connection.end();
    console.log('Done!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDb();
