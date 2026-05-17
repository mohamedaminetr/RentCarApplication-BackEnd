const pool = require('./db');

async function check() {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', ['test@gmail.com']);
  console.log(result.rows[0]);
  process.exit(0);
}
check();
