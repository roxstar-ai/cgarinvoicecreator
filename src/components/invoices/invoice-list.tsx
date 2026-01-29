'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate, formatMonthYear } from '@/lib/utils';
import { InvoiceActions } from '@/components/invoices/invoice-actions';
import { FileText, Printer, CheckCircle, Circle, Plus, Clock } from 'lucide-react';
import type { Invoice } from '@/lib/supabase/types';

interface InvoiceListProps {
  invoices: Invoice[];
  statusFilter: string;
}

export function InvoiceList({ invoices, statusFilter }: InvoiceListProps) {
  const router = useRouter();
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());

  // Group invoices by service month
  const groupedInvoices = useMemo(() => {
    return invoices.reduce((groups, invoice) => {
      const month = invoice.service_month;
      if (!groups[month]) {
        groups[month] = [];
      }
      groups[month].push(invoice);
      return groups;
    }, {} as Record<string, Invoice[]>);
  }, [invoices]);

  // Find the most recent batch of invoices (same created_at timestamp within 1 minute)
  const recentlyGeneratedIds = useMemo(() => {
    if (invoices.length === 0) return new Set<string>();

    // Sort by created_at descending to find the most recent
    const sorted = [...invoices].sort((a, b) =>
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );

    const mostRecentTime = new Date(sorted[0].created_at || 0).getTime();
    const oneMinute = 60 * 1000;

    // Get all invoices created within 1 minute of the most recent one (same batch)
    const recentIds = sorted
      .filter((inv) => mostRecentTime - new Date(inv.created_at || 0).getTime() < oneMinute)
      .map((inv) => inv.id);

    return new Set(recentIds);
  }, [invoices]);

  const statusColors: Record<string, string> = {
    draft: 'bg-yellow-100 text-yellow-800',
    sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
  };

  const toggleInvoice = (id: string) => {
    const newSet = new Set(selectedInvoices);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedInvoices(newSet);
  };

  const selectAllInMonth = (monthInvoices: Invoice[]) => {
    const newSet = new Set(selectedInvoices);
    monthInvoices.forEach((inv) => newSet.add(inv.id));
    setSelectedInvoices(newSet);
  };

  const selectNoneInMonth = (monthInvoices: Invoice[]) => {
    const newSet = new Set(selectedInvoices);
    monthInvoices.forEach((inv) => newSet.delete(inv.id));
    setSelectedInvoices(newSet);
  };

  const selectAll = () => {
    setSelectedInvoices(new Set(invoices.map((inv) => inv.id)));
  };

  const selectNone = () => {
    setSelectedInvoices(new Set());
  };

  const selectRecentlyGenerated = () => {
    setSelectedInvoices(new Set(recentlyGeneratedIds));
  };

  const handlePrintSelected = () => {
    if (selectedInvoices.size === 0) return;
    const ids = Array.from(selectedInvoices).join(',');
    router.push(`/invoices/print?ids=${ids}`);
  };

  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No invoices found</h3>
          <p className="text-gray-700 mb-4">
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
    );
  }

  return (
    <div className="space-y-4">
      {/* Selection Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <span className="text-sm text-gray-700">
            {selectedInvoices.size} of {invoices.length} selected
          </span>
          <div className="flex flex-wrap gap-2">
            {recentlyGeneratedIds.size > 0 && (
              <Button variant="outline" size="sm" onClick={selectRecentlyGenerated}>
                <Clock className="w-3 h-3 mr-1" />
                Select Recent ({recentlyGeneratedIds.size})
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={selectNone}>
              Select None
            </Button>
          </div>
        </div>
        <Button
          onClick={handlePrintSelected}
          disabled={selectedInvoices.size === 0}
        >
          <Printer className="w-4 h-4 mr-2" />
          Print Selected ({selectedInvoices.size})
        </Button>
      </div>

      {/* Invoice List */}
      <div className="space-y-8">
        {Object.entries(groupedInvoices)
          .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
          .map(([month, monthInvoices]) => {
            const allSelected = monthInvoices.every((inv) => selectedInvoices.has(inv.id));
            const someSelected = monthInvoices.some((inv) => selectedInvoices.has(inv.id));

            return (
              <div key={month}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {formatMonthYear(month)} Services
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700">
                      {monthInvoices.length} invoice{monthInvoices.length === 1 ? '' : 's'}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        allSelected
                          ? selectNoneInMonth(monthInvoices)
                          : selectAllInMonth(monthInvoices)
                      }
                    >
                      {allSelected ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3">
                  {monthInvoices.map((invoice) => {
                    const isSelected = selectedInvoices.has(invoice.id);

                    return (
                      <Card
                        key={invoice.id}
                        className={`hover:shadow-md transition-shadow cursor-pointer ${
                          isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => toggleInvoice(invoice.id)}
                      >
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0">
                                {isSelected ? (
                                  <CheckCircle className="h-6 w-6 text-blue-600" />
                                ) : (
                                  <Circle className="h-6 w-6 text-gray-300" />
                                )}
                              </div>
                              <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                <FileText className="h-5 w-5 text-gray-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/invoices/${invoice.id}`);
                                    }}
                                  >
                                    {invoice.invoice_number}
                                  </span>
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                      statusColors[invoice.status]
                                    }`}
                                  >
                                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">
                                  {invoice.customer_name}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="hidden md:flex items-center gap-4 text-sm text-gray-700">
                                <span>Service: {formatMonthYear(invoice.service_month)}</span>
                                <span>•</span>
                                <span>Invoiced: {formatDate(invoice.invoice_date)}</span>
                                <span>•</span>
                                <span>Due: {formatDate(invoice.due_date)}</span>
                              </div>
                              <p className="font-semibold text-gray-900">
                                {formatCurrency(invoice.total_amount)}
                              </p>
                              <div onClick={(e) => e.stopPropagation()}>
                                <InvoiceActions invoice={invoice} />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
