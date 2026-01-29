import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, UserCheck, UserX, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CustomerActions } from '@/components/customers/customer-actions';

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filter = params.filter || 'active';
  const supabase = await createClient();

  let query = supabase.from('customers').select('*').order('name');

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

      {/* Customer List */}
      {customers && customers.length > 0 ? (
        <div className="grid gap-4">
          {customers.map((customer) => {
            const total =
              customer.monthly_rate +
              (customer.additional_line_1_amount || 0) +
              (customer.additional_line_2_amount || 0) +
              (customer.additional_line_3_amount || 0);

            return (
              <Card key={customer.id} className={!customer.is_active ? 'opacity-60' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {customer.name}
                        {!customer.is_active && (
                          <span className="text-xs font-normal bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            Inactive
                          </span>
                        )}
                      </CardTitle>
                      {customer.address && (
                        <p className="text-sm text-gray-700">
                          {customer.address}
                          {customer.city_state_zip && `, ${customer.city_state_zip}`}
                        </p>
                      )}
                    </div>
                    <CustomerActions customer={customer} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-700">Monthly Rate:</span>
                      <p className="font-medium">{formatCurrency(customer.monthly_rate)}</p>
                    </div>
                    {customer.additional_line_1_desc && (
                      <div>
                        <span className="text-gray-700">{customer.additional_line_1_desc}:</span>
                        <p className="font-medium">{formatCurrency(customer.additional_line_1_amount || 0)}</p>
                      </div>
                    )}
                    {customer.additional_line_2_desc && (
                      <div>
                        <span className="text-gray-700">{customer.additional_line_2_desc}:</span>
                        <p className="font-medium">{formatCurrency(customer.additional_line_2_amount || 0)}</p>
                      </div>
                    )}
                    {customer.additional_line_3_desc && (
                      <div>
                        <span className="text-gray-700">{customer.additional_line_3_desc}:</span>
                        <p className="font-medium">{formatCurrency(customer.additional_line_3_amount || 0)}</p>
                      </div>
                    )}
                    <div className="col-span-2 md:col-span-1 md:text-right">
                      <span className="text-gray-700">Monthly Total:</span>
                      <p className="font-bold text-lg text-blue-600">{formatCurrency(total)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No residents found</h3>
            <p className="text-gray-700 mb-4">
              {filter === 'active'
                ? 'No active residents. Add a new resident to get started.'
                : filter === 'inactive'
                ? 'No inactive residents.'
                : 'No residents yet. Add your first resident to get started.'}
            </p>
            <Link href="/customers/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Resident
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
