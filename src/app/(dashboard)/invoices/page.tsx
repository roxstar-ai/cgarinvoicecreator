import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, Printer } from 'lucide-react';
import { formatCurrency, formatDate, formatMonthYear } from '@/lib/utils';
import { InvoiceActions } from '@/components/invoices/invoice-actions';

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

  // Group invoices by service month
  const groupedInvoices = (invoices || []).reduce((groups, invoice) => {
    const month = invoice.service_month;
    if (!groups[month]) {
      groups[month] = [];
    }
    groups[month].push(invoice);
    return groups;
  }, {} as Record<string, typeof invoices>);

  const statusColors: Record<string, string> = {
    draft: 'bg-yellow-100 text-yellow-800',
    sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
  };

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
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          All
        </Link>
        <Link
          href="/invoices?status=draft"
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            statusFilter === 'draft'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Draft
        </Link>
        <Link
          href="/invoices?status=sent"
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            statusFilter === 'sent'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Sent
        </Link>
        <Link
          href="/invoices?status=paid"
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            statusFilter === 'paid'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Paid
        </Link>
      </div>

      {/* Invoice List */}
      {invoices && invoices.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedInvoices)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([month, monthInvoices]) => (
              <div key={month}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {formatMonthYear(month)} Services
                  </h2>
                  <span className="text-sm text-gray-500">
                    {monthInvoices!.length} invoice{monthInvoices!.length === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="grid gap-3">
                  {monthInvoices!.map((invoice) => (
                    <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                              <FileText className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/invoices/${invoice.id}`}
                                  className="font-medium text-gray-900 hover:text-blue-600"
                                >
                                  {invoice.invoice_number}
                                </Link>
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    statusColors[invoice.status]
                                  }`}
                                >
                                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">
                                {invoice.customer_name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                              <p className="text-sm text-gray-500">
                                Due: {formatDate(invoice.due_date)}
                              </p>
                            </div>
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(invoice.total_amount)}
                            </p>
                            <InvoiceActions invoice={invoice} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No invoices found</h3>
            <p className="text-gray-500 mb-4">
              {statusFilter !== 'all'
                ? `No ${statusFilter} invoices. Try a different filter.`
                : 'Generate your first set of invoices to get started.'}
            </p>
            <Link href="/invoices/generate">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Generate Invoices
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
