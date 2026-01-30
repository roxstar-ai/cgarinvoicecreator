'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate, formatMonthYear } from '@/lib/utils';
import { updateInvoiceStatus, deleteInvoice } from '@/actions/invoices';
import { CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react';
import type { Invoice } from '@/lib/supabase/types';

interface CustomerInvoiceHistoryProps {
  invoices: Invoice[];
}

export function CustomerInvoiceHistory({ invoices }: CustomerInvoiceHistoryProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleStatusChange = async (invoiceId: string, newStatus: 'unpaid' | 'paid') => {
    setLoadingId(invoiceId);
    await updateInvoiceStatus(invoiceId, newStatus);
    setLoadingId(null);
    router.refresh();
  };

  const handleDelete = async (invoiceId: string) => {
    setLoadingId(invoiceId);
    await deleteInvoice(invoiceId);
    setDeleteConfirmId(null);
    setLoadingId(null);
    router.refresh();
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Invoice #</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Service Month</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Invoice Date</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Due Date</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Amount</th>
            <th className="py-3 px-2 w-24"></th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice, index) => (
            <tr
              key={invoice.id}
              className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
            >
              <td className="py-1.5 px-4">
                <Link
                  href={`/invoices/${invoice.id}`}
                  className="font-medium text-blue-900 hover:text-blue-700"
                >
                  {invoice.invoice_number}
                </Link>
              </td>
              <td className="py-1.5 px-4 text-sm text-gray-600">
                {formatMonthYear(invoice.service_month)}
              </td>
              <td className="py-1.5 px-4 text-sm text-gray-600">
                {formatDate(invoice.invoice_date)}
              </td>
              <td className="py-1.5 px-4 text-sm text-gray-600">
                {formatDate(invoice.due_date)}
              </td>
              <td className="py-1.5 px-4">
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
              <td className="py-1.5 px-4 text-sm text-gray-900">
                {formatCurrency(invoice.total_amount)}
              </td>
              <td className="py-1.5 px-2">
                <div className="flex items-center gap-1">
                  {/* Toggle Paid/Unpaid */}
                  {invoice.status === 'paid' ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                      onClick={() => handleStatusChange(invoice.id, 'unpaid')}
                      disabled={loadingId === invoice.id}
                      title="Mark as Unpaid"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handleStatusChange(invoice.id, 'paid')}
                      disabled={loadingId === invoice.id}
                      title="Mark as Paid"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                  {/* View */}
                  <Link href={`/invoices/${invoice.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-900 hover:text-blue-700 hover:bg-blue-50"
                      title="View Invoice"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  {/* Delete */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setDeleteConfirmId(invoice.id)}
                    disabled={loadingId === invoice.id}
                    title="Delete Invoice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Invoice
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this invoice? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
                disabled={loadingId !== null}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={loadingId !== null}
              >
                {loadingId === deleteConfirmId ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
