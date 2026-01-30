-- Update backup tables to use the original ID as the primary key
-- This allows us to do upserts instead of always inserting

-- Drop the old backup tables and recreate with better structure
DROP TABLE IF EXISTS customers_backup;
DROP TABLE IF EXISTS invoices_backup;

-- Customers backup table - uses original customer id as primary key
CREATE TABLE customers_backup (
    id UUID PRIMARY KEY,  -- Same as the original customer id
    name TEXT NOT NULL,
    first_name TEXT,
    middle_name TEXT,
    last_name TEXT,
    responsible_first_name TEXT,
    responsible_middle_name TEXT,
    responsible_last_name TEXT,
    address TEXT,
    city_state_zip TEXT,
    phone TEXT,
    email TEXT,
    monthly_rate DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    daily_rate DECIMAL(10, 2),
    daily_rate_days INTEGER,
    additional_line_1_desc TEXT,
    additional_line_1_amount DECIMAL(10, 2),
    additional_line_2_desc TEXT,
    additional_line_2_amount DECIMAL(10, 2),
    additional_line_3_desc TEXT,
    additional_line_3_amount DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    original_created_at TIMESTAMPTZ,
    original_updated_at TIMESTAMPTZ,
    backup_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    backup_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoices backup table - uses original invoice id as primary key
CREATE TABLE invoices_backup (
    id UUID PRIMARY KEY,  -- Same as the original invoice id
    customer_id UUID,
    invoice_number TEXT NOT NULL,
    service_month DATE NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_address TEXT,
    customer_city_state_zip TEXT,
    monthly_rate DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    daily_rate DECIMAL(10, 2),
    daily_rate_days INTEGER,
    daily_rate_total DECIMAL(10, 2),
    line_1_desc TEXT,
    line_1_amount DECIMAL(10, 2),
    line_2_desc TEXT,
    line_2_amount DECIMAL(10, 2),
    line_3_desc TEXT,
    line_3_amount DECIMAL(10, 2),
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL,
    notes TEXT,
    original_created_at TIMESTAMPTZ,
    original_updated_at TIMESTAMPTZ,
    backup_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    backup_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE customers_backup ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices_backup ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can view customers_backup" ON customers_backup
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert customers_backup" ON customers_backup
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update customers_backup" ON customers_backup
    FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete customers_backup" ON customers_backup
    FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view invoices_backup" ON invoices_backup
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert invoices_backup" ON invoices_backup
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update invoices_backup" ON invoices_backup
    FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete invoices_backup" ON invoices_backup
    FOR DELETE TO authenticated USING (true);

-- Drop old functions
DROP FUNCTION IF EXISTS perform_backup();
DROP FUNCTION IF EXISTS cleanup_old_backups(INTEGER);

-- New incremental backup function using UPSERT
CREATE OR REPLACE FUNCTION perform_backup()
RETURNS json AS $$
DECLARE
    customers_inserted INTEGER := 0;
    customers_updated INTEGER := 0;
    invoices_inserted INTEGER := 0;
    invoices_updated INTEGER := 0;
BEGIN
    -- Upsert customers (insert new, update existing)
    WITH upserted AS (
        INSERT INTO customers_backup (
            id, name, first_name, middle_name, last_name,
            responsible_first_name, responsible_middle_name, responsible_last_name,
            address, city_state_zip, phone, email, monthly_rate,
            daily_rate, daily_rate_days,
            additional_line_1_desc, additional_line_1_amount,
            additional_line_2_desc, additional_line_2_amount,
            additional_line_3_desc, additional_line_3_amount,
            is_active, notes, original_created_at, original_updated_at,
            backup_created_at, backup_updated_at
        )
        SELECT
            id, name, first_name, middle_name, last_name,
            responsible_first_name, responsible_middle_name, responsible_last_name,
            address, city_state_zip, phone, email, monthly_rate,
            daily_rate, daily_rate_days,
            additional_line_1_desc, additional_line_1_amount,
            additional_line_2_desc, additional_line_2_amount,
            additional_line_3_desc, additional_line_3_amount,
            is_active, notes, created_at, updated_at,
            NOW(), NOW()
        FROM customers
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            first_name = EXCLUDED.first_name,
            middle_name = EXCLUDED.middle_name,
            last_name = EXCLUDED.last_name,
            responsible_first_name = EXCLUDED.responsible_first_name,
            responsible_middle_name = EXCLUDED.responsible_middle_name,
            responsible_last_name = EXCLUDED.responsible_last_name,
            address = EXCLUDED.address,
            city_state_zip = EXCLUDED.city_state_zip,
            phone = EXCLUDED.phone,
            email = EXCLUDED.email,
            monthly_rate = EXCLUDED.monthly_rate,
            daily_rate = EXCLUDED.daily_rate,
            daily_rate_days = EXCLUDED.daily_rate_days,
            additional_line_1_desc = EXCLUDED.additional_line_1_desc,
            additional_line_1_amount = EXCLUDED.additional_line_1_amount,
            additional_line_2_desc = EXCLUDED.additional_line_2_desc,
            additional_line_2_amount = EXCLUDED.additional_line_2_amount,
            additional_line_3_desc = EXCLUDED.additional_line_3_desc,
            additional_line_3_amount = EXCLUDED.additional_line_3_amount,
            is_active = EXCLUDED.is_active,
            notes = EXCLUDED.notes,
            original_created_at = EXCLUDED.original_created_at,
            original_updated_at = EXCLUDED.original_updated_at,
            backup_updated_at = NOW()
        WHERE customers_backup.original_updated_at IS DISTINCT FROM EXCLUDED.original_updated_at
        RETURNING (xmax = 0) AS inserted
    )
    SELECT
        COUNT(*) FILTER (WHERE inserted),
        COUNT(*) FILTER (WHERE NOT inserted)
    INTO customers_inserted, customers_updated
    FROM upserted;

    -- Upsert invoices (insert new, update existing)
    WITH upserted AS (
        INSERT INTO invoices_backup (
            id, customer_id, invoice_number, service_month,
            invoice_date, due_date, customer_name, customer_address, customer_city_state_zip,
            monthly_rate, daily_rate, daily_rate_days, daily_rate_total,
            line_1_desc, line_1_amount, line_2_desc, line_2_amount,
            line_3_desc, line_3_amount, total_amount, status, notes,
            original_created_at, original_updated_at, backup_created_at, backup_updated_at
        )
        SELECT
            id, customer_id, invoice_number, service_month,
            invoice_date, due_date, customer_name, customer_address, customer_city_state_zip,
            monthly_rate, daily_rate, daily_rate_days, daily_rate_total,
            line_1_desc, line_1_amount, line_2_desc, line_2_amount,
            line_3_desc, line_3_amount, total_amount, status, notes,
            created_at, updated_at, NOW(), NOW()
        FROM invoices
        ON CONFLICT (id) DO UPDATE SET
            customer_id = EXCLUDED.customer_id,
            invoice_number = EXCLUDED.invoice_number,
            service_month = EXCLUDED.service_month,
            invoice_date = EXCLUDED.invoice_date,
            due_date = EXCLUDED.due_date,
            customer_name = EXCLUDED.customer_name,
            customer_address = EXCLUDED.customer_address,
            customer_city_state_zip = EXCLUDED.customer_city_state_zip,
            monthly_rate = EXCLUDED.monthly_rate,
            daily_rate = EXCLUDED.daily_rate,
            daily_rate_days = EXCLUDED.daily_rate_days,
            daily_rate_total = EXCLUDED.daily_rate_total,
            line_1_desc = EXCLUDED.line_1_desc,
            line_1_amount = EXCLUDED.line_1_amount,
            line_2_desc = EXCLUDED.line_2_desc,
            line_2_amount = EXCLUDED.line_2_amount,
            line_3_desc = EXCLUDED.line_3_desc,
            line_3_amount = EXCLUDED.line_3_amount,
            total_amount = EXCLUDED.total_amount,
            status = EXCLUDED.status,
            notes = EXCLUDED.notes,
            original_created_at = EXCLUDED.original_created_at,
            original_updated_at = EXCLUDED.original_updated_at,
            backup_updated_at = NOW()
        WHERE invoices_backup.original_updated_at IS DISTINCT FROM EXCLUDED.original_updated_at
        RETURNING (xmax = 0) AS inserted
    )
    SELECT
        COUNT(*) FILTER (WHERE inserted),
        COUNT(*) FILTER (WHERE NOT inserted)
    INTO invoices_inserted, invoices_updated
    FROM upserted;

    RETURN json_build_object(
        'success', true,
        'timestamp', NOW(),
        'customers', json_build_object('inserted', customers_inserted, 'updated', customers_updated),
        'invoices', json_build_object('inserted', invoices_inserted, 'updated', invoices_updated)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove the cleanup cron job since we no longer need it
SELECT cron.unschedule('weekly-cleanup');
