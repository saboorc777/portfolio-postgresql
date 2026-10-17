import 'dotenv/config';
import Database from 'better-sqlite3';
import { initializeDatabase, closeDatabase } from './database.js';
import pool from './database.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const sqlitePath = path.join(here, 'portfolio.sqlite.backup');
const sqlite = new Database(sqlitePath, { readonly: true, fileMustExist: true });

const tables = ['admins', 'projects', 'certificates', 'settings'];
let client;

try {
  await initializeDatabase();
  client = await pool.connect();
  await client.query('BEGIN');

  for (const table of tables) {
    const rows = sqlite.prepare(`SELECT * FROM "${table}"`).all();

    for (const row of rows) {
      if (table === 'admins') {
        await client.query(
          'INSERT INTO admins(id, username, password_hash, created_at) VALUES($1,$2,$3,$4) ON CONFLICT(id) DO NOTHING',
          [row.id, row.username, row.password_hash, row.created_at]
        );
      } else if (table === 'projects') {
        await client.query(
          'INSERT INTO projects(id,title,description,category,tech,github,live,image,featured,created_at) VALUES($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9,$10) ON CONFLICT(id) DO NOTHING',
          [row.id, row.title, row.description, row.category, JSON.stringify(JSON.parse(row.tech || '[]')), row.github, row.live, row.image, Boolean(row.featured), row.created_at]
        );
      } else if (table === 'certificates') {
        await client.query(
          'INSERT INTO certificates(id,title,issuer,image,file_url,created_at) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(id) DO NOTHING',
          [row.id, row.title, row.issuer, row.image, row.file_url, row.created_at]
        );
      } else if (table === 'settings') {
        await client.query(
          'INSERT INTO settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value',
          [row.key, row.value]
        );
      }
    }

    console.log(`Read ${rows.length} SQLite rows from ${table}.`);
  }

  for (const table of ['admins', 'projects', 'certificates']) {
    await client.query(
      `SELECT setval(pg_get_serial_sequence('${table}','id'), GREATEST(COALESCE((SELECT MAX(id) FROM ${table}),1),1), EXISTS(SELECT 1 FROM ${table}))`
    );
  }

  await client.query('COMMIT');
  console.log('SQLite data import completed successfully.');
} catch (err) {
  if (client) {
    try { await client.query('ROLLBACK'); } catch {}
  }
  console.error('SQLite import failed:', err.message);
  process.exitCode = 1;
} finally {
  if (client) client.release();
  sqlite.close();
  await closeDatabase();
}
