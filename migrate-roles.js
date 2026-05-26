const pool = require('./db');
const bcrypt = require('bcryptjs');

async function migrate() {
  try {
    // Step 1: Drop the old check constraint on role
    await pool.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check
    `);
    console.log('✓ Dropped old role constraint');

    // Step 2: Add new constraint accepting all 3 roles
    await pool.query(`
      ALTER TABLE users
      ADD CONSTRAINT users_role_check
      CHECK (role IN ('client', 'admin', 'superAdmin'))
    `);
    console.log('✓ Added new role constraint (client, admin, superAdmin)');

    // Step 3: Create the superAdmin account if it doesn't exist
    const existing = await pool.query(`SELECT id FROM users WHERE role = 'superAdmin' LIMIT 1`);
    if (existing.rows.length === 0) {
      const hashed = await bcrypt.hash('SuperAdmin@2025', 10);
      await pool.query(`
        INSERT INTO users ("firstName", "lastName", email, password, role)
        VALUES ($1, $2, $3, $4, $5)
      `, ['Super', 'Admin', 'superadmin@rentcar.com', hashed, 'superAdmin']);
      console.log('✓ Created superAdmin account: superadmin@rentcar.com / SuperAdmin@2025');
    } else {
      console.log('✓ superAdmin account already exists');
    }

    console.log('\n✅ Migration complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
}

migrate();
