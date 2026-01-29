import { createClient } from '@/lib/supabase/server';
import { BulkPrintView } from '@/components/invoices/bulk-print-view';

interface PageProps {
  searchParams: Promise<{ ids?: string }>;
}

export default async function BulkPrintPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const ids = params.ids?.split(',').filter(Boolean) || [];

  if (ids.length === 0) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-md">
        No invoices selected for printing.
      </div>
    );
  }

  const supabase = await createClient();

  const { data: invoices, error: invoicesError } = await supabase
    .from('invoices')
    .select('*')
    .in('id', ids)
    .order('customer_name');

  const { data: facility } = await supabase
    .from('facility_settings')
    .select('*')
    .single();

  if (invoicesError) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-md">
        Error loading invoices: {invoicesError.message}
      </div>
    );
  }

  return <BulkPrintView invoices={invoices || []} facility={facility} />;
}
