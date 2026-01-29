'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format, startOfMonth, addMonths, setDate, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { generateInvoices } from '@/actions/invoices';
import { formatCurrency, calculateInvoiceTotal } from '@/lib/utils';
import type { Customer } from '@/lib/supabase/types';
import { CheckCircle, Circle, AlertCircle, Loader2 } from 'lucide-react';

interface InvoiceGeneratorProps {
  customers: Customer[];
}

function getDisplayName(customer: Customer): string {
  if (customer.first_name && customer.last_name) {
    return customer.middle_name
      ? `${customer.last_name}, ${customer.first_name} ${customer.middle_name}`
      : `${customer.last_name}, ${customer.first_name}`;
  }
  return customer.name;
}

export function InvoiceGenerator({ customers }: InvoiceGeneratorProps) {
  const router = useRouter();
  const now = new Date();

  // Default dates: Current month for services, today for invoice date, 15th of next month for due date
  const defaultServiceMonth = format(startOfMonth(now), 'yyyy-MM-dd');
  const defaultInvoiceDate = format(now, 'yyyy-MM-dd');
  const defaultDueDate = format(setDate(addMonths(now, 1), 15), 'yyyy-MM-dd');

  const [serviceMonth, setServiceMonth] = useState(defaultServiceMonth);
  const [invoiceDate, setInvoiceDate] = useState(defaultInvoiceDate);
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(
    new Set(customers.map((c) => c.id))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ count: number } | null>(null);

  const toggleCustomer = (id: string) => {
    const newSet = new Set(selectedCustomers);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedCustomers(newSet);
  };

  const selectAll = () => {
    setSelectedCustomers(new Set(customers.map((c) => c.id)));
  };

  const selectNone = () => {
    setSelectedCustomers(new Set());
  };

  const totalAmount = useMemo(() => {
    return customers
      .filter((c) => selectedCustomers.has(c.id))
      .reduce(
        (sum, c) =>
          sum +
          calculateInvoiceTotal(
            c.monthly_rate,
            c.additional_line_1_amount,
            c.additional_line_2_amount,
            c.additional_line_3_amount,
            c.daily_rate,
            c.daily_rate_days
          ),
        0
      );
  }, [customers, selectedCustomers]);

  const handleGenerate = async () => {
    if (selectedCustomers.size === 0) {
      setError('Please select at least one resident');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await generateInvoices({
      serviceMonth,
      invoiceDate,
      dueDate,
      customerIds: Array.from(selectedCustomers),
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/invoices');
    }
  };

  const serviceMonthFormatted = format(parseISO(serviceMonth), 'MMMM yyyy');

  return (
    <div className="space-y-6">
      {/* Date Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Dates</CardTitle>
          <CardDescription>
            Configure the service month and payment dates for the invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Month
              </label>
              <Input
                type="date"
                value={serviceMonth}
                onChange={(e) => setServiceMonth(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-700">
                Month services were rendered
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Date
              </label>
              <Input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-700">
                Date printed on invoice
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-700">
                Payment due by this date
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Select Residents</CardTitle>
              <CardDescription>
                Choose which residents to generate invoices for ({serviceMonthFormatted})
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={selectNone}>
                Select None
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-8 text-gray-700">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p>No active residents found. Add residents first.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {customers.map((customer) => {
                const total = calculateInvoiceTotal(
                  customer.monthly_rate,
                  customer.additional_line_1_amount,
                  customer.additional_line_2_amount,
                  customer.additional_line_3_amount,
                  customer.daily_rate,
                  customer.daily_rate_days
                );
                const isSelected = selectedCustomers.has(customer.id);
                const hasDaily = customer.daily_rate && customer.daily_rate_days;
                const hasMonthly = customer.monthly_rate > 0;

                return (
                  <div
                    key={customer.id}
                    onClick={() => toggleCustomer(customer.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isSelected ? (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                      <div>
                        <p className="font-medium">{getDisplayName(customer)}</p>
                        <p className="text-sm text-gray-700">
                          {hasMonthly && `Monthly: ${formatCurrency(customer.monthly_rate)}`}
                          {hasMonthly && hasDaily && ' + '}
                          {hasDaily && `Daily: ${formatCurrency(customer.daily_rate!)} × ${customer.daily_rate_days} days`}
                          {(customer.additional_line_1_amount ||
                            customer.additional_line_2_amount ||
                            customer.additional_line_3_amount) &&
                            ' + additional charges'}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(total)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary & Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-700">
                {selectedCustomers.size} of {customers.length} residents selected
              </p>
              <p className="text-2xl font-bold text-gray-900">
                Total: {formatCurrency(totalAmount)}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={loading || selectedCustomers.size === 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  `Generate ${selectedCustomers.size} Invoice${selectedCustomers.size === 1 ? '' : 's'}`
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Successfully generated {success.count} invoice{success.count === 1 ? '' : 's'}!
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/invoices')}
              >
                View Invoices
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
