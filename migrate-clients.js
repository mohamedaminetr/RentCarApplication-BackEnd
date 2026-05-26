const pool = require('./db');
const bcrypt = require('bcryptjs');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Starting migration...');

    // 1. Add new columns to users table
    console.log('Adding columns to users table...');
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS rentals INTEGER DEFAULT 0;`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "totalSpent" DECIMAL(10, 2) DEFAULT 0;`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "avatarClass" VARCHAR(50) DEFAULT 'av-teal';`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS initials VARCHAR(5);`);

    // 2. Fetch all clients
    console.log('Fetching clients...');
    const res = await client.query('SELECT * FROM clients');
    const clients = res.rows;

    const defaultPassword = await bcrypt.hash('Client@2025', 10);

    console.log(`Migrating ${clients.length} clients to users table...`);
    for (const c of clients) {
      // Split name into first and last
      const parts = c.name.split(' ');
      const firstName = parts[0] || 'Unknown';
      const lastName = parts.slice(1).join(' ') || 'Unknown';

      // Check if email already exists in users
      const userRes = await client.query('SELECT id FROM users WHERE email = $1', [c.email]);
      if (userRes.rows.length === 0) {
        // Insert new user
        await client.query(`
          INSERT INTO users ("firstName", "lastName", email, phone, password, role, rentals, "totalSpent", status, "avatarClass", initials)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          firstName, 
          lastName, 
          c.email, 
          c.phone, 
          defaultPassword, 
          'client', 
          c.rentals, 
          c.totalSpent, 
          c.status, 
          c.avatarClass, 
          c.initials
        ]);
        console.log(`Migrated client: ${c.email}`);
      } else {
        console.log(`Skipped client (email already exists in users): ${c.email}`);
      }
    }

    // 3. Drop clients table
    console.log('Dropping clients table...');
    await client.query('DROP TABLE IF EXISTS clients CASCADE');

    await client.query('COMMIT');
    console.log('✅ Migration completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate();
