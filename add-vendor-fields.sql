-- Add vendor-specific fields to the users table
-- This approach keeps everything in one table

ALTER TABLE users
ADD COLUMN IF NOT EXISTS photo VARCHAR(512) AFTER avatar_url,
ADD COLUMN IF NOT EXISTS gender ENUM('male', 'female', 'other') AFTER photo,
ADD COLUMN IF NOT EXISTS language VARCHAR(100) AFTER gender,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00 AFTER language,
ADD COLUMN IF NOT EXISTS priceperminute DECIMAL(10,2) DEFAULT 0.00 AFTER rating,
ADD COLUMN IF NOT EXISTS chatstatus ENUM('available', 'busy', 'offline') DEFAULT 'available' AFTER priceperminute,
ADD COLUMN IF NOT EXISTS callstatus ENUM('available', 'busy', 'offline') DEFAULT 'available' AFTER chatstatus,
ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive', 'suspended') DEFAULT 'active' AFTER callstatus;

-- Update existing vendor with sample data
UPDATE users 
SET 
  photo = 'https://i.pravatar.cc/200?img=12',
  gender = 'male',
  language = 'Hindi, English',
  rating = 4.85,
  priceperminute = 25.00,
  chatstatus = 'available',
  callstatus = 'available',
  status = 'active'
WHERE id = 2 AND role = 'vendor';

-- Verify the changes
SELECT id, name, role, photo, gender, language, rating, priceperminute, chatstatus, callstatus, status 
FROM users 
WHERE role = 'vendor';
