-- Alternative: Create a separate community table for vendors
-- Use this if you prefer keeping vendor data separate

CREATE TABLE IF NOT EXISTS community (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  photo VARCHAR(512),
  gender ENUM('male', 'female', 'other'),
  language VARCHAR(100),
  rating DECIMAL(3,2) DEFAULT 0.00,
  priceperminute DECIMAL(10,2) DEFAULT 0.00,
  chatstatus ENUM('available', 'busy', 'offline') DEFAULT 'available',
  callstatus ENUM('available', 'busy', 'offline') DEFAULT 'available',
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  specialization TEXT,
  experience_years INT DEFAULT 0,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample vendor data
INSERT INTO community (id, user_id, name, photo, gender, language, rating, priceperminute, chatstatus, callstatus, status, specialization, experience_years, bio)
VALUES (
  2, 2, 'Astro Uttam Pandey', 
  'https://i.pravatar.cc/200?img=12',
  'male',
  'Hindi, English',
  4.85,
  25.00,
  'available',
  'available',
  'active',
  'Vedic Astrology, Numerology, Vastu',
  15,
  'Expert astrologer with 15 years of experience in Vedic astrology, numerology, and vastu shastra.'
)
ON DUPLICATE KEY UPDATE 
  name=VALUES(name), 
  photo=VALUES(photo),
  rating=VALUES(rating),
  priceperminute=VALUES(priceperminute);

-- Verify the data
SELECT * FROM community;
