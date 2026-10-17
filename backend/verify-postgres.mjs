import 'dotenv/config';
import pool from './db/database.js';

try {
  const tables = ['admins', 'projects', 'certificates', 'settings'];

  for (const table of tables) {
    const result = await pool.query(`SELECT COUNT(*)::int AS total FROM "${table}"`);
    console.log(`${table}: ${result.rows[0].total} rows`);
  }
} catch (error) {
  console.log('Check failed:', error.message);
} finally {
  await pool.end();
}
