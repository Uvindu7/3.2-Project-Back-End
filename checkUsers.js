const db = require('./configs/db');

const checkUsers = async () => {
  try {
    const res = await db.query('SELECT COUNT(*) FROM users');
    console.log(`Connection successful!`);
    console.log(`Database name in use: ${process.env.DB_NAME}`);
    console.log(`Total users in 'users' table: ${res.rows[0].count}`);
    process.exit(0);
  } catch (err) {
    console.error('Error checking users:', err.message);
    process.exit(1);
  }
};

checkUsers();
