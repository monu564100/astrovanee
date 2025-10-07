-- Complete MySQL Schema for Astro Consultation App
-- Run this in your VPS MySQL database (via phpMyAdmin or mysql CLI)

-- IMPORTANT: This will DROP and recreate tables (deletes all data!)
-- If you want to keep existing data, use add-missing-columns.sql instead

DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS consultation;
DROP TABLE IF EXISTS users;

-- Users table (both customers and vendors)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(200),
  phone VARCHAR(20),
  role ENUM('user', 'vendor', 'admin') DEFAULT 'user',
  avatar_url VARCHAR(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Consultation table (singular - matches your code!)
CREATE TABLE IF NOT EXISTS consultation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customerid INT NOT NULL,
  vendorid INT NOT NULL,
  consultationstatus ENUM('pending', 'ringing', 'ongoing', 'chatting', 'ended', 'declined', 'missed', 'cancelled') DEFAULT 'pending',
  category VARCHAR(100),
  bookingdate DATETIME,
  name VARCHAR(150),
  phone VARCHAR(20),
  birthdate DATE,
  birthtime TIME,
  birthplace VARCHAR(200),
  age INT,
  gender ENUM('male', 'female', 'other'),
  lookingfor TEXT,
  preference VARCHAR(100),
  timing VARCHAR(100),
  price DECIMAL(10, 2),
  transactionid VARCHAR(255),
  paymentstatus ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  vendoraction VARCHAR(50),
  vendoracceptedon DATETIME,
  customeraction VARCHAR(50),
  customeracceptedon DATETIME,
  endedon DATETIME,
  endedby VARCHAR(50),
  remaining_time INT DEFAULT 300,
  settled BOOLEAN DEFAULT FALSE,
  merchantuserid VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  vendorreminder BOOLEAN DEFAULT FALSE,
  customerreminder BOOLEAN DEFAULT FALSE,
  uid INT,
  calltoken TEXT,
  channelName VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customerid (customerid),
  INDEX idx_vendorid (vendorid),
  INDEX idx_status (consultationstatus),
  INDEX idx_bookingdate (bookingdate),
  FOREIGN KEY (customerid) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (vendorid) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  consultationId INT NOT NULL,
  senderId INT NOT NULL,
  body TEXT NOT NULL,
  sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_consultation (consultationId),
  INDEX idx_sender (senderId),
  FOREIGN KEY (consultationId) REFERENCES consultation(id) ON DELETE CASCADE,
  FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  consultation_id INT NOT NULL,
  user_id INT NOT NULL,
  rating TINYINT CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_consultation (consultation_id),
  INDEX idx_user (user_id),
  FOREIGN KEY (consultation_id) REFERENCES consultation(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample users for testing
INSERT INTO users (id, name, email, phone, role, avatar_url) VALUES
(1, 'Test User', 'user@test.com', '1234567890', 'user', 'https://i.pravatar.cc/200?img=1'),
(2, 'Astro Uttam Pandey', 'vendor@test.com', '9876543210', 'vendor', 'https://i.pravatar.cc/200?img=12')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert sample consultation for testing (ID 420)
INSERT INTO consultation (
  id, customerid, vendorid, consultationstatus, category, bookingdate, 
  name, phone, birthdate, birthtime, birthplace, age, gender, 
  lookingfor, preference, timing, price, transactionid, paymentstatus,
  remaining_time, channelName
) VALUES (
  420, 1, 2, 'pending', 'general', NOW(),
  'Test User', '1234567890', '1990-01-01', '12:00:00', 'Test City', 35, 'male',
  'Career guidance', 'Video call', 'Evening', 500.00, 'TXN123456', 'completed',
  300, 'c_420'
)
ON DUPLICATE KEY UPDATE consultationstatus='pending';

-- Verify tables created
SELECT 'Tables created successfully!' AS Status;
SHOW TABLES;
