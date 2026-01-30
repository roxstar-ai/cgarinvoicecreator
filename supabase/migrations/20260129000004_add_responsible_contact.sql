-- Add responsible contact fields to customers table
ALTER TABLE customers
ADD COLUMN responsible_first_name TEXT,
ADD COLUMN responsible_middle_name TEXT,
ADD COLUMN responsible_last_name TEXT;

-- Add comment for documentation
COMMENT ON COLUMN customers.responsible_first_name IS 'First name of the responsible contact for billing';
COMMENT ON COLUMN customers.responsible_middle_name IS 'Middle name of the responsible contact for billing';
COMMENT ON COLUMN customers.responsible_last_name IS 'Last name of the responsible contact for billing';
