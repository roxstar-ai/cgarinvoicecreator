-- Change invoice status from draft/sent/paid to unpaid/paid

-- First drop the old constraint so we can update values
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;

-- Update all existing invoices that are not 'paid' to 'unpaid'
UPDATE invoices SET status = 'unpaid' WHERE status != 'paid';

-- Add the new constraint
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check
CHECK (status IN ('unpaid', 'paid'));
