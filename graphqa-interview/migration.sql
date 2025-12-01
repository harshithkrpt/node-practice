CREATE DATABASE graphqldb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE graphqldb;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  completed TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO users (name, email, password_hash) VALUES
('Aarav Kumar', 'aarav.k@example.com', 'hash_01_x8sd9f'),
('Diya Sharma', 'diya.s@example.com', 'hash_02_kdj29d'),
('Harish Patel', 'harish.p@example.com', 'hash_03_92jd02'),
('Meera Nair', 'meera.n@example.com', 'hash_04_20d9dk'),
('Rohan Gupta', 'rohan.g@example.com', 'hash_05_kk203d'),
('Kavya Rao', 'kavya.r@example.com', 'hash_06_39dkk2'),
('Siddharth Jain', 'sid.j@example.com', 'hash_07_dd92kd'),
('Ananya Iyer', 'ananya.i@example.com', 'hash_08_22dkd0'),
('Vikram Singh', 'vikram.s@example.com', 'hash_09_dk292k'),
('Sneha Menon', 'sneha.m@example.com', 'hash_10_9dk203');
