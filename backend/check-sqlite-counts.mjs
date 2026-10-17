import Database from 'better-sqlite3';

const db = new Database('./db/portfolio.sqlite.backup', {
  readonly: true,
  fileMustExist: true
});

try {
  for (const table of ['admins', 'projects', 'certificates', 'settings']) {
    const result = db.prepare(`SELECT COUNT(*) AS total FROM "${table}"`).get();
    console.log(`${table}: ${result.total} rows in SQLite backup`);
  }
} finally {
  db.close();
}
