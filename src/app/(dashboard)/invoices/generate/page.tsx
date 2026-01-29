import { createClient } from '@/lib/supabase/server';
import { InvoiceGenerator } from '@/components/invoices/invoice-generator';

export default async function GenerateInvoicesPage() {
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .eq('is_active', true)
    .order('name');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Generate Invoices</h1>
        <p className="text-gray-600">Create monthly invoices for all active residents</p>
      </div>
      <InvoiceGenerator customers={customers || []} />
    </div>
  );
}
