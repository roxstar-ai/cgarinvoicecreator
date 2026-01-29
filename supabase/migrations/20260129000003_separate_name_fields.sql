-- Add separate name fields to customers table
ALTER TABLE customers
ADD COLUMN first_name TEXT,
ADD COLUMN middle_name TEXT,
ADD COLUMN last_name TEXT;

-- Migrate existing name data to last_name (assuming current names are full names)
-- Users will need to manually update first/last names for existing records
UPDATE customers SET last_name = name WHERE name IS NOT NULL;

-- Make first_name and last_name required for new records (after migration)
-- Note: We keep the old 'name' column for backwards compatibility with invoices
