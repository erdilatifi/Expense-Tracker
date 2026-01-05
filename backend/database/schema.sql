CREATE DATABASE IF NOT EXISTS expense_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE expense_tracker;

CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(32) NOT NULL,
  icon VARCHAR(64) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_categories_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS expenses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  amount_cents INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  expense_date DATE NOT NULL,
  note VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_expenses_date (expense_date),
  KEY idx_expenses_category (category_id),
  CONSTRAINT fk_expenses_category FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB;

INSERT INTO categories (name, color, icon, sort_order) VALUES
  ('Food', '#22c55e', 'utensils', 10),
  ('Rent', '#a855f7', 'home', 20),
  ('Transport', '#38bdf8', 'car', 30),
  ('Shopping', '#fb7185', 'shopping-bag', 40),
  ('Bills', '#f59e0b', 'receipt', 50),
  ('Health', '#ef4444', 'heart-pulse', 60),
  ('Entertainment', '#60a5fa', 'film', 70),
  ('Other', '#a1a1aa', 'circle-dot', 80)
ON DUPLICATE KEY UPDATE name = name;
