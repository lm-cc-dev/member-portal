import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env file
dotenv.config({ path: resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkUser() {
  try {
    const result = await pool.query(
      'SELECT id, email, "baserowMemberId", "createdAt" FROM "user" WHERE email = $1',
      ['test1@gmail.com']
    );

    if (result.rows.length > 0) {
      console.log('✅ User exists in Postgres:');
      console.log(JSON.stringify(result.rows[0], null, 2));
    } else {
      console.log('❌ No user found with email test1@gmail.com');
    }
  } catch (err: any) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkUser();
