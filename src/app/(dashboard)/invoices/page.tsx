import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { InvoiceList } from '@/components/invoices/invoice-list';

interface PageProps {
  searchParams: Promise<{ status?: string; month?: string }>;
}

export default async function InvoicesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const statusFilter = params.status || 'all';
  const supabase = await createClient();

  let query = supabase
    .from('invoices')
    .select('*')
    .order('invoice_date', { ascending: false })
    .order('customer_name');

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data: invoices, error } = await query;

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-md">
        Error loading invoices: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">View and manage all generated invoices</p>
        </div>
        <div className="flex gap-2">
          <Link href="/invoices/generate">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Generate Invoices
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <Link
          href="/invoices?status=all"
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            statusFilter === 'all'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          All
        </Link>
        <Link
          href="/invoices?status=unpaid"
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            statusFilter === 'unpaid'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Unpaid
        </Link>
        <Link
          href="/invoices?status=paid"
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            statusFilter === 'paid'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Paid
        </Link>
      </div>

      {/* Invoice List with Selection */}
      <InvoiceList invoices={invoices || []} statusFilter={statusFilter} />
    </div>
  );
}
