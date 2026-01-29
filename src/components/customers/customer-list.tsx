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
      return customer.middle_name
        ? `${customer.last_name}, ${customer.first_name} ${customer.middle_name}`
        : `${customer.last_name}, ${customer.first_name}`;
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
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 placeholder:text-gray-500"
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

      {/* Customer List */}
      {filteredAndSortedCustomers.length > 0 ? (
        <div className="grid gap-2">
          {filteredAndSortedCustomers.map((customer) => {
            const dailyTotal = (customer.daily_rate || 0) * (customer.daily_rate_days || 0);
            const total =
              customer.monthly_rate +
              dailyTotal +
              (customer.additional_line_1_amount || 0) +
              (customer.additional_line_2_amount || 0) +
              (customer.additional_line_3_amount || 0);

            // Build rate summary
            const rateParts: string[] = [];
            if (customer.monthly_rate > 0) {
              rateParts.push(`Monthly: ${formatCurrency(customer.monthly_rate)}`);
            }
            if (customer.daily_rate && customer.daily_rate_days) {
              rateParts.push(`Daily: ${formatCurrency(dailyTotal)} (${customer.daily_rate_days}d)`);
            }
            if (customer.additional_line_1_amount) {
              rateParts.push(`${customer.additional_line_1_desc}: ${formatCurrency(customer.additional_line_1_amount)}`);
            }
            if (customer.additional_line_2_amount) {
              rateParts.push(`${customer.additional_line_2_desc}: ${formatCurrency(customer.additional_line_2_amount)}`);
            }
            if (customer.additional_line_3_amount) {
              rateParts.push(`${customer.additional_line_3_desc}: ${formatCurrency(customer.additional_line_3_amount)}`);
            }

            return (
              <div
                key={customer.id}
                className={`flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg ${!customer.is_active ? 'opacity-60' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 truncate">
                      {getDisplayName(customer)}
                    </span>
                    {!customer.is_active && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {rateParts.join(' • ')}
                  </p>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{formatCurrency(total)}</p>
                  </div>
                  <CustomerActions customer={customer} />
                </div>
              </div>
            );
          })}
        </div>
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
