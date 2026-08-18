const fs = require('fs');
const path = require('path');

const USE_DB = !!process.env.DATABASE_URL;

let pool;
let ready;

if (USE_DB) {
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  ready = pool.query(`
    CREATE TABLE IF NOT EXISTS submissions (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      restaurant TEXT,
      phone TEXT,
      message TEXT NOT NULL,
      submitted_at TIMESTAMPTZ NOT NULL
    )
  `);
} else {
  const DATA_DIR = path.join(__dirname, '..', 'data');
  const DATA_FILE = path.join(DATA_DIR, 'submissions.json');

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');

  var readFileSubmissions = () => {
    try {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch {
      return [];
    }
  };
  var writeFileSubmissions = (list) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
  };
}

async function getAllSubmissions() {
  if (USE_DB) {
    await ready;
    const { rows } = await pool.query(
      'SELECT id, name, email, restaurant, phone, message, submitted_at AS "submittedAt" FROM submissions ORDER BY submitted_at DESC'
    );
    return rows;
  }
  return readFileSubmissions();
}

async function addSubmission(entry) {
  if (USE_DB) {
    await ready;
    await pool.query(
      'INSERT INTO submissions (id, name, email, restaurant, phone, message, submitted_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [entry.id, entry.name, entry.email, entry.restaurant, entry.phone, entry.message, entry.submittedAt]
    );
    return;
  }
  const submissions = readFileSubmissions();
  submissions.unshift(entry);
  writeFileSubmissions(submissions);
}

module.exports = { getAllSubmissions, addSubmission, USE_DB };
