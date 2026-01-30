'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { updateInvoiceStatus, deleteInvoice } from '@/actions/invoices';
import type { Invoice } from '@/lib/supabase/types';
import { Eye, CheckCircle, Trash2, XCircle } from 'lucide-react';

interface InvoiceActionsProps {
  invoice: Invoice;
}

export function InvoiceActions({ invoice }: InvoiceActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (status: 'unpaid' | 'paid') => {
    setLoading(true);
    await updateInvoiceStatus(invoice.id, status);
    setLoading(false);
    router.refresh();
  };

  const handleDelete = async () => {
    setLoading(true);
    await deleteInvoice(invoice.id);
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1">
      {/* View/Print */}
      <Link href={`/invoices/${invoice.id}`}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-blue-900 hover:text-blue-700 hover:bg-blue-50"
          title="View / Print"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </Link>

      {/* Toggle Paid/Unpaid */}
      {invoice.status === 'paid' ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
          onClick={() => handleStatusChange('unpaid')}
          disabled={loading}
          title="Mark as Unpaid"
        >
          <XCircle className="w-4 h-4" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
          onClick={() => handleStatusChange('paid')}
          disabled={loading}
          title="Mark as Paid"
        >
          <CheckCircle className="w-4 h-4" />
        </Button>
      )}

      {/* Delete */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={() => setShowDeleteConfirm(true)}
        disabled={loading}
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Invoice
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete invoice <strong>{invoice.invoice_number}</strong> for{' '}
              <strong>{invoice.customer_name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
