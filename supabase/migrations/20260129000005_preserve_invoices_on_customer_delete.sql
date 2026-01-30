-- Change invoices foreign key to preserve invoices when customer is deleted
-- Instead of CASCADE delete, set customer_id to NULL

-- First, drop the existing foreign key constraint
ALTER TABLE invoices DROP CONSTRAINT invoices_customer_id_fkey;

-- Make customer_id nullable
ALTER TABLE invoices ALTER COLUMN customer_id DROP NOT NULL;

-- Add new foreign key constraint with SET NULL on delete
ALTER TABLE invoices
ADD CONSTRAINT invoices_customer_id_fkey
FOREIGN KEY (customer_id)
REFERENCES customers(id)
ON DELETE SET NULL;

-- Add comment for documentation
COMMENT ON COLUMN invoices.customer_id IS 'Reference to customer, set to NULL if customer is deleted (invoices are preserved)';
