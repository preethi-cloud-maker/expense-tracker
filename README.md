# SpendWise MVP

A full-stack Personal Expense Tracker web application built with React, Node.js, Express, and MySQL.

## Prerequisites
- Node.js (v16+)
- MySQL Server running locally on port 3306

## Setup Instructions

### 1. Database Setup
1. Ensure your local MySQL server is running (default `root` user, no password).
2. Open terminal in the `server` directory.
3. Run the init script to create the database, tables, and seed data:
   ```bash
   node init_db.js
   ```
*(Note: If you use different MySQL credentials, update the `.env` file in the `/server` folder first).*

### 2. Backend Setup
1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Start the Express server:
   ```bash
   npm start
   # or for development: npm run dev
   ```
The API will run on `http://localhost:5000`.

### 3. Frontend Setup
1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
The React app will typically run on `http://localhost:5173`.

## Demo Account
Once everything is running, you can log in using the seeded demo account to see the dashboard populated with data:
- **Email**: `demo@spendwise.com`
- **Password**: `password`
