-- Add daily rate fields to customers table
ALTER TABLE customers
ADD COLUMN daily_rate DECIMAL(10, 2),
ADD COLUMN daily_rate_days INTEGER;

-- Add daily rate fields to invoices table (snapshot at time of invoice)
ALTER TABLE invoices
ADD COLUMN daily_rate DECIMAL(10, 2),
ADD COLUMN daily_rate_days INTEGER,
ADD COLUMN daily_rate_total DECIMAL(10, 2);
