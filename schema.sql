CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  limit_amount REAL NOT NULL,
  period TEXT DEFAULT 'monthly',
  color TEXT
);

CREATE TABLE IF NOT EXISTS investments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  symbol TEXT,
  type TEXT NOT NULL,
  quantity REAL DEFAULT 1,
  buy_price REAL NOT NULL,
  current_price REAL,
  interest_rate REAL,
  maturity_date TEXT,
  currency TEXT DEFAULT 'TRY',
  date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  target_amount REAL NOT NULL,
  current_amount REAL DEFAULT 0,
  deadline TEXT,
  color TEXT,
  icon TEXT
);
