'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toggleCustomerActive, deleteCustomer } from '@/actions/customers';
import type { Customer } from '@/lib/supabase/types';
import { Eye, Edit, Trash2, UserCheck, UserX } from 'lucide-react';

interface CustomerActionsProps {
  customer: Customer;
}

export function CustomerActions({ customer }: CustomerActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  const handleToggleActive = async () => {
    setLoading(true);
    await toggleCustomerActive(customer.id, !customer.is_active);
    setLoading(false);
    router.refresh();
  };

  const handleDelete = async () => {
    setLoading(true);
    await deleteCustomer(customer.id);
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-1">
      {/* View */}
      <Link href={`/customers/${customer.id}`}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-blue-900 hover:text-blue-700 hover:bg-blue-50"
          title="View"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </Link>

      {/* Edit */}
      <Link href={`/customers/${customer.id}/edit`}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </Link>

      {/* Toggle Active/Inactive */}
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 ${customer.is_active ? 'text-purple-600 hover:text-purple-700 hover:bg-purple-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}`}
        onClick={handleToggleActive}
        disabled={loading}
        title={customer.is_active ? 'Mark Inactive' : 'Mark Active'}
      >
        {customer.is_active ? (
          <UserX className="w-4 h-4" />
        ) : (
          <UserCheck className="w-4 h-4" />
        )}
      </Button>

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
              Delete Resident
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <strong>{customer.name}</strong>? Any existing invoices for this resident will be preserved. This action cannot be undone.
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
