-- Carroll Golden Age Retreat - Invoice Creator Schema
-- Initial migration: Create all tables

-- ============================================
-- Facility Settings Table
-- ============================================
CREATE TABLE facility_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city_state_zip TEXT NOT NULL,
    phone TEXT,
    fax TEXT,
    website TEXT,
    email TEXT,
    thank_you_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default facility settings
INSERT INTO facility_settings (name, address, city_state_zip, phone, fax, website, email, thank_you_note)
VALUES (
    'Carroll Golden Age Retreat',
    '2202 Kensington Road NE',
    'Carrollton, OH 44615',
    '330-627-4665',
    '330-627-7772',
    'www.carrollgoldenageretreat.com',
    'JFaulk@carrollgar.org',
    'Thank you for choosing Carroll Golden Age Retreat. We appreciate your prompt payment.'
);

-- ============================================
-- Customers (Residents) Table
-- ============================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    city_state_zip TEXT,
    phone TEXT,
    email TEXT,
    monthly_rate DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    additional_line_1_desc TEXT,
    additional_line_1_amount DECIMAL(10, 2),
    additional_line_2_desc TEXT,
    additional_line_2_amount DECIMAL(10, 2),
    additional_line_3_desc TEXT,
    additional_line_3_amount DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for active customers (frequently queried)
CREATE INDEX idx_customers_is_active ON customers(is_active);

-- ============================================
-- Invoices Table
-- ============================================
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL UNIQUE,
    service_month DATE NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    -- Snapshot of customer data at time of invoice creation
    customer_name TEXT NOT NULL,
    customer_address TEXT,
    customer_city_state_zip TEXT,
    -- Line items (snapshot from customer profile)
    monthly_rate DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    line_1_desc TEXT,
    line_1_amount DECIMAL(10, 2),
    line_2_desc TEXT,
    line_2_amount DECIMAL(10, 2),
    line_3_desc TEXT,
    line_3_amount DECIMAL(10, 2),
    -- Calculated total
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_service_month ON invoices(service_month);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);

-- ============================================
-- Invoice Number Sequence
-- ============================================
-- We'll use a sequence to track the invoice number counter per year
CREATE TABLE invoice_number_sequence (
    year INTEGER PRIMARY KEY,
    last_number INTEGER NOT NULL DEFAULT 0
);

-- ============================================
-- Function to generate invoice number
-- ============================================
CREATE OR REPLACE FUNCTION generate_invoice_number(p_year INTEGER)
RETURNS TEXT AS $$
DECLARE
    v_next_number INTEGER;
BEGIN
    -- Insert or update the sequence for this year
    INSERT INTO invoice_number_sequence (year, last_number)
    VALUES (p_year, 1)
    ON CONFLICT (year) DO UPDATE
    SET last_number = invoice_number_sequence.last_number + 1
    RETURNING last_number INTO v_next_number;

    -- Return formatted invoice number: CGAR-YYYY-NNN
    RETURN 'CGAR-' || p_year::TEXT || '-' || LPAD(v_next_number::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_facility_settings_updated_at
    BEFORE UPDATE ON facility_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- ============================================
-- Enable RLS on all tables
ALTER TABLE facility_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_number_sequence ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (simple auth - all authenticated users can do everything)
CREATE POLICY "Authenticated users can view facility_settings" ON facility_settings
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update facility_settings" ON facility_settings
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view customers" ON customers
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert customers" ON customers
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update customers" ON customers
    FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete customers" ON customers
    FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view invoices" ON invoices
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert invoices" ON invoices
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update invoices" ON invoices
    FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete invoices" ON invoices
    FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view invoice_number_sequence" ON invoice_number_sequence
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert invoice_number_sequence" ON invoice_number_sequence
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update invoice_number_sequence" ON invoice_number_sequence
    FOR UPDATE TO authenticated USING (true);
