'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { updateInvoiceStatus, deleteInvoice } from '@/actions/invoices';
import type { Invoice } from '@/lib/supabase/types';
import { MoreHorizontal, Printer, Send, CheckCircle, Trash2, Eye } from 'lucide-react';

interface InvoiceActionsProps {
  invoice: Invoice;
}

export function InvoiceActions({ invoice }: InvoiceActionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (status: 'draft' | 'sent' | 'paid') => {
    setLoading(true);
    await updateInvoiceStatus(invoice.id, status);
    setLoading(false);
    setShowMenu(false);
    router.refresh();
  };

  const handleDelete = async () => {
    setLoading(true);
    await deleteInvoice(invoice.id);
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowMenu(!showMenu)}
        disabled={loading}
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 z-20 mt-1 w-48 rounded-md bg-white shadow-lg border border-gray-200">
            <div className="py-1">
              <Link
                href={`/invoices/${invoice.id}`}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setShowMenu(false)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View / Print
              </Link>

              <div className="border-t border-gray-100 my-1" />

              <button
                onClick={() => handleStatusChange('draft')}
                disabled={invoice.status === 'draft'}
                className={`flex items-center w-full px-4 py-2 text-sm ${
                  invoice.status === 'draft'
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="w-4 h-4 mr-2 rounded-full bg-yellow-400" />
                Mark as Draft
              </button>
              <button
                onClick={() => handleStatusChange('sent')}
                disabled={invoice.status === 'sent'}
                className={`flex items-center w-full px-4 py-2 text-sm ${
                  invoice.status === 'sent'
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Send className="w-4 h-4 mr-2 text-blue-500" />
                Mark as Sent
              </button>
              <button
                onClick={() => handleStatusChange('paid')}
                disabled={invoice.status === 'paid'}
                className={`flex items-center w-full px-4 py-2 text-sm ${
                  invoice.status === 'paid'
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Mark as Paid
              </button>

              <div className="border-t border-gray-100 my-1" />

              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowDeleteConfirm(true);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </>
      )}

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
