CREATE TABLE job_runs (
    job_key VARCHAR(255) PRIMARY KEY, 
    completed_at DATETIME NULL
);

CREATE TABLE temp_files (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  email VARCHAR(200),
  wants_daily_reminder TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, wants_daily_reminder)
VALUES 
  ('Asha',    'asha@example.com',    1),
  ('Bharath', 'bharath@example.com', 1),
  ('Chaitra', 'chaitra@example.com', 0),
  ('Devi',    'devi@example.com',    1),
  ('Eshan',   'eshan@example.com',   1);
