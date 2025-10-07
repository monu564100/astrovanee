-- Add all missing columns to match your backend code
-- Run this in your VPS MySQL (phpMyAdmin SQL tab)

USE astro;

-- Add all columns that your code expects
ALTER TABLE consultation
  ADD COLUMN IF NOT EXISTS customerid INT AFTER id,
  ADD COLUMN IF NOT EXISTS vendorid INT AFTER customerid,
  ADD COLUMN IF NOT EXISTS consultationstatus VARCHAR(50) DEFAULT 'pending' AFTER vendorid,
  ADD COLUMN IF NOT EXISTS category VARCHAR(100) AFTER consultationstatus,
  ADD COLUMN IF NOT EXISTS bookingdate DATETIME AFTER category,
  ADD COLUMN IF NOT EXISTS name VARCHAR(150) AFTER bookingdate,
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20) AFTER name,
  ADD COLUMN IF NOT EXISTS birthdate DATE AFTER phone,
  ADD COLUMN IF NOT EXISTS birthtime TIME AFTER birthdate,
  ADD COLUMN IF NOT EXISTS birthplace VARCHAR(200) AFTER birthtime,
  ADD COLUMN IF NOT EXISTS age INT AFTER birthplace,
  ADD COLUMN IF NOT EXISTS gender ENUM('male', 'female', 'other') AFTER age,
  ADD COLUMN IF NOT EXISTS lookingfor TEXT AFTER gender,
  ADD COLUMN IF NOT EXISTS preference VARCHAR(100) AFTER lookingfor,
  ADD COLUMN IF NOT EXISTS timing VARCHAR(100) AFTER preference,
  ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) AFTER timing,
  ADD COLUMN IF NOT EXISTS transactionid VARCHAR(255) AFTER price,
  ADD COLUMN IF NOT EXISTS paymentstatus VARCHAR(50) DEFAULT 'pending' AFTER transactionid,
  ADD COLUMN IF NOT EXISTS vendoraction VARCHAR(50) AFTER paymentstatus,
  ADD COLUMN IF NOT EXISTS vendoracceptedon DATETIME AFTER vendoraction,
  ADD COLUMN IF NOT EXISTS customeraction VARCHAR(50) AFTER vendoracceptedon,
  ADD COLUMN IF NOT EXISTS customeracceptedon DATETIME AFTER customeraction,
  ADD COLUMN IF NOT EXISTS endedon DATETIME AFTER customeracceptedon,
  ADD COLUMN IF NOT EXISTS endedby VARCHAR(50) AFTER endedon,
  ADD COLUMN IF NOT EXISTS remaining_time INT DEFAULT 300 AFTER endedby,
  ADD COLUMN IF NOT EXISTS settled BOOLEAN DEFAULT FALSE AFTER remaining_time,
  ADD COLUMN IF NOT EXISTS merchantuserid VARCHAR(100) AFTER settled,
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8) AFTER merchantuserid,
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8) AFTER latitude,
  ADD COLUMN IF NOT EXISTS vendorreminder BOOLEAN DEFAULT FALSE AFTER longitude,
  ADD COLUMN IF NOT EXISTS customerreminder BOOLEAN DEFAULT FALSE AFTER vendorreminder,
  ADD COLUMN IF NOT EXISTS uid INT AFTER customerreminder,
  ADD COLUMN IF NOT EXISTS calltoken TEXT AFTER uid,
  ADD COLUMN IF NOT EXISTS channelName VARCHAR(255) AFTER calltoken;

-- Copy data from existing columns to new ones
UPDATE consultation SET 
  customerid = user_id,
  vendorid = vendor_id,
  consultationstatus = COALESCE(status, 'pending'),
  channelName = channel_name
WHERE customerid IS NULL OR vendorid IS NULL;

-- Add indexes for better performance
ALTER TABLE consultation
  ADD INDEX IF NOT EXISTS idx_customerid (customerid),
  ADD INDEX IF NOT EXISTS idx_vendorid (vendorid),
  ADD INDEX IF NOT EXISTS idx_consultationstatus (consultationstatus);

-- Insert sample data if table is empty
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

-- Verify
SELECT 'Columns added successfully!' AS Status;
DESCRIBE consultation;
