import 'dotenv/config';
import fs from 'node:fs/promises';
import pool from './db/database.js';

try {
  const sql = await fs.readFile('./db/schema.sql', 'utf8');
  const statements = sql.split(';').map(s => s.trim()).filter(Boolean);

  for (let i = 0; i < statements.length; i++) {
    try {
      await pool.query(statements[i]);
      console.log(`Statement ${i + 1}: OK`);
    } catch (error) {
      console.log(`Statement ${i + 1}: FAILED`);
      console.log(error.message);
      break;
    }
  }
} catch (error) {
  console.log('Test error:', error.message);
} finally {
  await pool.end();
}
