import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { InvoicePrintView } from '@/components/invoices/invoice-print-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoicePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get the invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single();

  if (invoiceError || !invoice) {
    notFound();
  }

  // Get facility settings
  const { data: facility } = await supabase
    .from('facility_settings')
    .select('*')
    .single();

  return (
    <InvoicePrintView
      invoice={invoice}
      facility={facility}
    />
  );
}
