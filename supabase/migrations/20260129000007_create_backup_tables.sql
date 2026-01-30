-- Create backup tables for customers and invoices

-- Customers backup table
CREATE TABLE customers_backup (
    backup_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    backup_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Original customer data
    id UUID NOT NULL,
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
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- Invoices backup table
CREATE TABLE invoices_backup (
    backup_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    backup_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Original invoice data
    id UUID NOT NULL,
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
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- Create indexes for efficient querying by backup timestamp
CREATE INDEX idx_customers_backup_timestamp ON customers_backup(backup_timestamp DESC);
CREATE INDEX idx_invoices_backup_timestamp ON invoices_backup(backup_timestamp DESC);

-- Enable RLS
ALTER TABLE customers_backup ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices_backup ENABLE ROW LEVEL SECURITY;

-- RLS policies for authenticated users
CREATE POLICY "Authenticated users can view customers_backup" ON customers_backup
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert customers_backup" ON customers_backup
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can delete customers_backup" ON customers_backup
    FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view invoices_backup" ON invoices_backup
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert invoices_backup" ON invoices_backup
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can delete invoices_backup" ON invoices_backup
    FOR DELETE TO authenticated USING (true);

-- Function to perform the backup
CREATE OR REPLACE FUNCTION perform_backup()
RETURNS json AS $$
DECLARE
    customers_count INTEGER;
    invoices_count INTEGER;
    backup_time TIMESTAMPTZ;
BEGIN
    backup_time := NOW();

    -- Backup customers
    INSERT INTO customers_backup (
        backup_timestamp, id, name, first_name, middle_name, last_name,
        responsible_first_name, responsible_middle_name, responsible_last_name,
        address, city_state_zip, phone, email, monthly_rate,
        daily_rate, daily_rate_days,
        additional_line_1_desc, additional_line_1_amount,
        additional_line_2_desc, additional_line_2_amount,
        additional_line_3_desc, additional_line_3_amount,
        is_active, notes, created_at, updated_at
    )
    SELECT
        backup_time, id, name, first_name, middle_name, last_name,
        responsible_first_name, responsible_middle_name, responsible_last_name,
        address, city_state_zip, phone, email, monthly_rate,
        daily_rate, daily_rate_days,
        additional_line_1_desc, additional_line_1_amount,
        additional_line_2_desc, additional_line_2_amount,
        additional_line_3_desc, additional_line_3_amount,
        is_active, notes, created_at, updated_at
    FROM customers;

    GET DIAGNOSTICS customers_count = ROW_COUNT;

    -- Backup invoices
    INSERT INTO invoices_backup (
        backup_timestamp, id, customer_id, invoice_number, service_month,
        invoice_date, due_date, customer_name, customer_address, customer_city_state_zip,
        monthly_rate, daily_rate, daily_rate_days, daily_rate_total,
        line_1_desc, line_1_amount, line_2_desc, line_2_amount,
        line_3_desc, line_3_amount, total_amount, status, notes,
        created_at, updated_at
    )
    SELECT
        backup_time, id, customer_id, invoice_number, service_month,
        invoice_date, due_date, customer_name, customer_address, customer_city_state_zip,
        monthly_rate, daily_rate, daily_rate_days, daily_rate_total,
        line_1_desc, line_1_amount, line_2_desc, line_2_amount,
        line_3_desc, line_3_amount, total_amount, status, notes,
        created_at, updated_at
    FROM invoices;

    GET DIAGNOSTICS invoices_count = ROW_COUNT;

    RETURN json_build_object(
        'success', true,
        'backup_timestamp', backup_time,
        'customers_backed_up', customers_count,
        'invoices_backed_up', invoices_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old backups (keep last N days)
CREATE OR REPLACE FUNCTION cleanup_old_backups(days_to_keep INTEGER DEFAULT 30)
RETURNS json AS $$
DECLARE
    customers_deleted INTEGER;
    invoices_deleted INTEGER;
    cutoff_date TIMESTAMPTZ;
BEGIN
    cutoff_date := NOW() - (days_to_keep || ' days')::INTERVAL;

    DELETE FROM customers_backup WHERE backup_timestamp < cutoff_date;
    GET DIAGNOSTICS customers_deleted = ROW_COUNT;

    DELETE FROM invoices_backup WHERE backup_timestamp < cutoff_date;
    GET DIAGNOSTICS invoices_deleted = ROW_COUNT;

    RETURN json_build_object(
        'success', true,
        'cutoff_date', cutoff_date,
        'customers_deleted', customers_deleted,
        'invoices_deleted', invoices_deleted
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
