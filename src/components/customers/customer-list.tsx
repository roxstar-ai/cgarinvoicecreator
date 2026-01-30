'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { CustomerActions } from '@/components/customers/customer-actions';
import { Search, ArrowUpDown, Users, Plus } from 'lucide-react';
import type { Customer } from '@/lib/supabase/types';

interface CustomerListProps {
  customers: Customer[];
  filter: string;
}

type SortField = 'first_name' | 'last_name';
type SortDirection = 'asc' | 'desc';

export function CustomerList({ customers, filter }: CustomerListProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('last_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedCustomers = useMemo(() => {
    let result = [...customers];

    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter((customer) => {
        const firstName = (customer.first_name || '').toLowerCase();
        const middleName = (customer.middle_name || '').toLowerCase();
        const lastName = (customer.last_name || '').toLowerCase();
        const fullName = (customer.name || '').toLowerCase();
        return (
          firstName.includes(searchLower) ||
          middleName.includes(searchLower) ||
          lastName.includes(searchLower) ||
          fullName.includes(searchLower)
        );
      });
    }

    // Sort
    result.sort((a, b) => {
      const aValue = (a[sortField] || a.name || '').toLowerCase();
      const bValue = (b[sortField] || b.name || '').toLowerCase();

      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return result;
  }, [customers, search, sortField, sortDirection]);

  const getDisplayName = (customer: Customer) => {
    if (customer.first_name && customer.last_name) {
      if (sortField === 'first_name') {
        // First name sort: "John William Doe"
        return customer.middle_name
          ? `${customer.first_name} ${customer.middle_name} ${customer.last_name}`
          : `${customer.first_name} ${customer.last_name}`;
      } else {
        // Last name sort: "Doe, John William"
        return customer.middle_name
          ? `${customer.last_name}, ${customer.first_name} ${customer.middle_name}`
          : `${customer.last_name}, ${customer.first_name}`;
      }
    }
    return customer.name;
  };

  if (customers.length === 0) {
    return (
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
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search residents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent text-gray-900 placeholder:text-gray-500"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortField === 'first_name' ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleSort('first_name')}
            className="flex items-center gap-1"
          >
            First Name
            <ArrowUpDown className="w-3 h-3" />
            {sortField === 'first_name' && (
              <span className="text-xs">({sortDirection === 'asc' ? 'A-Z' : 'Z-A'})</span>
            )}
          </Button>
          <Button
            variant={sortField === 'last_name' ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleSort('last_name')}
            className="flex items-center gap-1"
          >
            Last Name
            <ArrowUpDown className="w-3 h-3" />
            {sortField === 'last_name' && (
              <span className="text-xs">({sortDirection === 'asc' ? 'A-Z' : 'Z-A'})</span>
            )}
          </Button>
        </div>
      </div>

      {/* Results count */}
      {search && (
        <p className="text-sm text-gray-600">
          Found {filteredAndSortedCustomers.length} of {customers.length} residents
        </p>
      )}

      {/* Customer Table */}
      {filteredAndSortedCustomers.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Name</th>
                  <th className="py-3 px-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Monthly</th>
                  <th className="py-3 px-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Daily</th>
                  <th className="py-3 px-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Item 1</th>
                  <th className="py-3 px-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Item 2</th>
                  <th className="py-3 px-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Item 3</th>
                  <th className="py-3 px-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Total</th>
                  <th className="py-3 px-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedCustomers.map((customer, index) => {
                  const dailyTotal = (customer.daily_rate || 0) * (customer.daily_rate_days || 0);
                  const total =
                    customer.monthly_rate +
                    dailyTotal +
                    (customer.additional_line_1_amount || 0) +
                    (customer.additional_line_2_amount || 0) +
                    (customer.additional_line_3_amount || 0);

                  return (
                    <tr
                      key={customer.id}
                      className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${!customer.is_active ? 'opacity-60' : ''}`}
                    >
                      <td className="py-1.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{getDisplayName(customer)}</span>
                          {!customer.is_active && (
                            <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                              Inactive
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-1.5 px-3 text-right text-sm text-gray-600">
                        {customer.monthly_rate > 0 ? formatCurrency(customer.monthly_rate) : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="py-1.5 px-3 text-right text-sm text-gray-600">
                        {dailyTotal > 0 ? formatCurrency(dailyTotal) : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="py-1.5 px-3 text-right text-sm text-gray-600">
                        {customer.additional_line_1_amount ? formatCurrency(customer.additional_line_1_amount) : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="py-1.5 px-3 text-right text-sm text-gray-600">
                        {customer.additional_line_2_amount ? formatCurrency(customer.additional_line_2_amount) : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="py-1.5 px-3 text-right text-sm text-gray-600">
                        {customer.additional_line_3_amount ? formatCurrency(customer.additional_line_3_amount) : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="py-1.5 px-3 text-right text-sm text-gray-900">
                        {formatCurrency(total)}
                      </td>
                      <td className="py-1.5 px-2">
                        <CustomerActions customer={customer} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <Search className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-700">No residents match your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
