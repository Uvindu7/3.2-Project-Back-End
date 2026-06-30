const db = require('./configs/db');

const initDb = async () => {
  try {
    console.log('Checking for users table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database initialized successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing database:', err.message);
    process.exit(1);
  }
};

initDb();
