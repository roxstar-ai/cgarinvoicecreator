import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Plus, UserCheck, UserX, Users } from 'lucide-react';
import { CustomerList } from '@/components/customers/customer-list';

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filter = params.filter || 'active';
  const supabase = await createClient();

  let query = supabase.from('customers').select('*');

  if (filter === 'active') {
    query = query.eq('is_active', true);
  } else if (filter === 'inactive') {
    query = query.eq('is_active', false);
  }

  const { data: customers, error } = await query;

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-md">
        Error loading customers: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Residents</h1>
          <p className="text-gray-600">Manage resident profiles and billing information</p>
        </div>
        <Link href="/customers/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Resident
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <Link
          href="/customers?filter=active"
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2 ${
            filter === 'active'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Active
        </Link>
        <Link
          href="/customers?filter=inactive"
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2 ${
            filter === 'inactive'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <UserX className="w-4 h-4" />
          Inactive
        </Link>
        <Link
          href="/customers?filter=all"
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2 ${
            filter === 'all'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Users className="w-4 h-4" />
          All
        </Link>
      </div>

      {/* Customer List with Search and Sort */}
      <CustomerList customers={customers || []} filter={filter} />
    </div>
  );
}
