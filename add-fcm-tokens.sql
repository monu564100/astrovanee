-- Add FCM token columns to users and vendors tables for push notifications

-- Add FCM token to users table
ALTER TABLE users 
ADD COLUMN fcm_token VARCHAR(500) NULL,
ADD COLUMN fcm_token_updated_at TIMESTAMP NULL;

-- Add FCM token to vendors table  
ALTER TABLE vendors
ADD COLUMN fcm_token VARCHAR(500) NULL,
ADD COLUMN fcm_token_updated_at TIMESTAMP NULL;

-- Create index for faster lookups
CREATE INDEX idx_users_fcm_token ON users(fcm_token);
CREATE INDEX idx_vendors_fcm_token ON vendors(fcm_token);
