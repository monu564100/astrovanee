-- Quick fix: Rename table from consultations (plural) to consultation (singular)
-- Run this in your VPS MySQL (phpMyAdmin SQL tab or mysql command line)

-- Step 1: Rename the table
RENAME TABLE consultations TO consultation;

-- Step 2: Verify
SHOW TABLES;
-- Should show: consultation, messages, reviews, users

-- Step 3: Check structure
DESCRIBE consultation;

-- Done! Your backend code will now work.
