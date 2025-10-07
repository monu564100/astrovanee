-- Ensure sample users exist in the database
-- Run this in your VPS MySQL (phpMyAdmin SQL tab)

USE astro;

-- Insert or update sample users
INSERT INTO users (id, name, email, phone, role, avatar_url) VALUES
(1, 'Test User', 'user@test.com', '1234567890', 'user', 'https://i.pravatar.cc/200?img=1'),
(2, 'Astro Uttam Pandey', 'vendor@test.com', '9876543210', 'vendor', 'https://i.pravatar.cc/200?img=12')
ON DUPLICATE KEY UPDATE 
  name = VALUES(name),
  email = VALUES(email),
  role = VALUES(role);

-- Ensure consultation 420 exists with correct vendor
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
ON DUPLICATE KEY UPDATE 
  vendorid = 2,
  customerid = 1,
  consultationstatus = 'pending';

-- Verify
SELECT 'Users and consultation setup complete!' AS Status;
SELECT id, name, role FROM users;
SELECT id, customerid, vendorid, consultationstatus FROM consultation WHERE id = 420;
