'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate, formatMonthYear } from '@/lib/utils';
import { InvoiceActions } from '@/components/invoices/invoice-actions';
import { FileText, Printer, CheckCircle, Circle, Plus, Clock, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { Invoice } from '@/lib/supabase/types';

interface InvoiceListProps {
  invoices: Invoice[];
  statusFilter: string;
}

type SortField = 'invoice_number' | 'customer_name' | 'status' | 'service_month' | 'invoice_date' | 'due_date' | 'total_amount';
type SortDirection = 'asc' | 'desc';

export function InvoiceList({ invoices, statusFilter }: InvoiceListProps) {
  const router = useRouter();
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('invoice_number');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="w-3 h-3 ml-1" />
      : <ArrowDown className="w-3 h-3 ml-1" />;
  };

  // Sort all invoices
  const sortedInvoices = useMemo(() => {
    return [...invoices].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortField) {
        case 'invoice_number':
          aVal = a.invoice_number;
          bVal = b.invoice_number;
          break;
        case 'customer_name':
          aVal = a.customer_name.toLowerCase();
          bVal = b.customer_name.toLowerCase();
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'service_month':
          aVal = a.service_month;
          bVal = b.service_month;
          break;
        case 'invoice_date':
          aVal = a.invoice_date;
          bVal = b.invoice_date;
          break;
        case 'due_date':
          aVal = a.due_date;
          bVal = b.due_date;
          break;
        case 'total_amount':
          aVal = a.total_amount;
          bVal = b.total_amount;
          break;
        default:
          aVal = a.invoice_number;
          bVal = b.invoice_number;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [invoices, sortField, sortDirection]);

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

  const toggleInvoice = (id: string) => {
    const newSet = new Set(selectedInvoices);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
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

      {/* Invoice Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide w-10"></th>
                  <th
                    className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => toggleSort('invoice_number')}
                  >
                    <div className="flex items-center">
                      Invoice #
                      {getSortIcon('invoice_number')}
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => toggleSort('customer_name')}
                  >
                    <div className="flex items-center">
                      Resident
                      {getSortIcon('customer_name')}
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => toggleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => toggleSort('service_month')}
                  >
                    <div className="flex items-center">
                      Service Month
                      {getSortIcon('service_month')}
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => toggleSort('invoice_date')}
                  >
                    <div className="flex items-center">
                      Invoiced
                      {getSortIcon('invoice_date')}
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => toggleSort('due_date')}
                  >
                    <div className="flex items-center">
                      Due
                      {getSortIcon('due_date')}
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => toggleSort('total_amount')}
                  >
                    <div className="flex items-center">
                      Total
                      {getSortIcon('total_amount')}
                    </div>
                  </th>
                  <th className="py-3 px-2 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {sortedInvoices.map((invoice, index) => {
                  const isSelected = selectedInvoices.has(invoice.id);

                  return (
                    <tr
                      key={invoice.id}
                      className={`hover:bg-blue-50 transition-colors cursor-pointer ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } ${isSelected ? 'ring-2 ring-inset ring-blue-500 bg-blue-50' : ''}`}
                      onClick={() => toggleInvoice(invoice.id)}
                    >
                      <td className="py-1.5 px-4">
                        <div className="flex-shrink-0">
                          {isSelected ? (
                            <CheckCircle className="h-5 w-5 text-blue-900" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-300" />
                          )}
                        </div>
                      </td>
                      <td className="py-1.5 px-4">
                        <span
                          className="font-medium text-gray-900 hover:text-blue-900 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/invoices/${invoice.id}`);
                          }}
                        >
                          {invoice.invoice_number}
                        </span>
                      </td>
                      <td className="py-1.5 px-4 text-sm text-gray-700">
                        {invoice.customer_name}
                      </td>
                      <td className="py-1.5 px-3">
                        {invoice.status === 'paid' ? (
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Paid
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Unpaid
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 px-3 text-left text-sm text-gray-600">
                        {formatMonthYear(invoice.service_month)}
                      </td>
                      <td className="py-1.5 px-3 text-left text-sm text-gray-600">
                        {formatDate(invoice.invoice_date)}
                      </td>
                      <td className="py-1.5 px-3 text-left text-sm text-gray-600">
                        {formatDate(invoice.due_date)}
                      </td>
                      <td className="py-1.5 px-3 text-left text-sm text-gray-900">
                        {formatCurrency(invoice.total_amount)}
                      </td>
                      <td className="py-1.5 px-2" onClick={(e) => e.stopPropagation()}>
                        <InvoiceActions invoice={invoice} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
