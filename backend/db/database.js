import pg from 'pg';
import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required. Set it in backend/.env or your hosting environment.');
}

const pool = new Pool({
  connectionString,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
  max: Number(process.env.PG_POOL_MAX || 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => console.error('Unexpected PostgreSQL pool error:', err));

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function initializeDatabase() {
  const schema = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
  const statements = schema.split(';').map(s => s.trim()).filter(Boolean);

  for (const statement of statements) {
    await pool.query(statement);
  }

  console.log('PostgreSQL schema is ready.');
}

export async function query(text, params = []) {
  return pool.query(text, params);
}

export async function closeDatabase() {
  await pool.end();
}

export default pool;
