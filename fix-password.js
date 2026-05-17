const pool = require('./db');
const bcrypt = require('bcryptjs');

async function fixPassword() {
  try {
    const hashedPassword = await bcrypt.hash('azerty1', 10);
    const result = await pool.query(
      `UPDATE users SET password = $1 WHERE email = $2 RETURNING *`,
      [hashedPassword, 'test@gmail.com']
    );
    if (result.rowCount > 0) {
      console.log('Successfully restored password for test@gmail.com');
    } else {
      console.log('User not found.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

fixPassword();
