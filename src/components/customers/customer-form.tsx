'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createCustomer, updateCustomer } from '@/actions/customers';
import type { Customer } from '@/lib/supabase/types';

interface CustomerFormProps {
  customer?: Customer;
  mode: 'create' | 'edit';
}

function formatAmount(value: number | null | undefined): string {
  if (value === null || value === undefined || value === 0) return '';
  return value.toFixed(2);
}

function formatDays(value: number | null | undefined): string {
  if (value === null || value === undefined || value === 0) return '';
  return value.toString();
}

export function CustomerForm({ customer, mode }: CustomerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyRate, setDailyRate] = useState<string>(formatAmount(customer?.daily_rate));
  const [days, setDays] = useState<string>(formatDays(customer?.daily_rate_days));

  const dailyTotal = dailyRate && days
    ? (parseFloat(dailyRate) * parseFloat(days)).toFixed(2)
    : '0.00';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const firstName = formData.get('first_name') as string;
    const middleName = formData.get('middle_name') as string || null;
    const lastName = formData.get('last_name') as string;

    // Build full name for backwards compatibility
    const fullName = middleName
      ? `${firstName} ${middleName} ${lastName}`
      : `${firstName} ${lastName}`;

    const data = {
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      name: fullName,
      address: formData.get('address') as string || null,
      city_state_zip: formData.get('city_state_zip') as string || null,
      phone: formData.get('phone') as string || null,
      email: formData.get('email') as string || null,
      monthly_rate: parseFloat(formData.get('monthly_rate') as string) || 0,
      daily_rate: parseFloat(formData.get('daily_rate') as string) || null,
      daily_rate_days: parseInt(formData.get('daily_rate_days') as string) || null,
      additional_line_1_desc: formData.get('additional_line_1_desc') as string || null,
      additional_line_1_amount: parseFloat(formData.get('additional_line_1_amount') as string) || null,
      additional_line_2_desc: formData.get('additional_line_2_desc') as string || null,
      additional_line_2_amount: parseFloat(formData.get('additional_line_2_amount') as string) || null,
      additional_line_3_desc: formData.get('additional_line_3_desc') as string || null,
      additional_line_3_amount: parseFloat(formData.get('additional_line_3_amount') as string) || null,
      is_active: true,
      notes: formData.get('notes') as string || null,
    };

    try {
      let result;
      if (mode === 'create') {
        result = await createCustomer(data);
      } else {
        result = await updateCustomer(customer!.id, data);
      }

      if (result?.error) {
        setError(result.error);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Resident Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="First Name"
              name="first_name"
              defaultValue={customer?.first_name || ''}
              required
              placeholder="John"
            />
            <Input
              label="Middle Name"
              name="middle_name"
              defaultValue={customer?.middle_name || ''}
              placeholder="William"
            />
            <Input
              label="Last Name"
              name="last_name"
              defaultValue={customer?.last_name || ''}
              required
              placeholder="Doe"
            />
          </div>
          <Input
            label="Address"
            name="address"
            defaultValue={customer?.address || ''}
            placeholder="123 Main Street"
          />
          <Input
            label="City, State ZIP"
            name="city_state_zip"
            defaultValue={customer?.city_state_zip || ''}
            placeholder="Carrollton, OH 44615"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone"
              name="phone"
              type="tel"
              defaultValue={customer?.phone || ''}
              placeholder="330-555-0100"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              defaultValue={customer?.email || ''}
              placeholder="john@example.com"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rates & Charges</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Monthly Care Rate ($)"
            name="monthly_rate"
            type="number"
            step="0.01"
            min="0"
            defaultValue={formatAmount(customer?.monthly_rate)}
            placeholder="0.00"
          />

          {/* Daily Rate - saved to profile */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="text-sm font-medium text-gray-800 mb-3">Daily Rate (for partial month stays)</h4>
            <div className="grid grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Daily Rate ($)
                </label>
                <input
                  type="number"
                  name="daily_rate"
                  step="0.01"
                  min="0"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(e.target.value)}
                  placeholder="0.00"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Days
                </label>
                <input
                  type="number"
                  name="daily_rate_days"
                  step="1"
                  min="0"
                  max="31"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder="0"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Total
                </label>
                <div className="flex h-10 w-full items-center rounded-md border border-blue-200 bg-blue-100 px-3 py-2 text-base font-semibold text-gray-900">
                  ${dailyTotal}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Line Items</h4>
            <p className="text-sm text-gray-700 mb-4">
              These charges will appear on every invoice for this resident.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                  <Input
                    label="Additional Item 1 Description"
                    name="additional_line_1_desc"
                    defaultValue={customer?.additional_line_1_desc || ''}
                    placeholder="e.g., Medication Management"
                  />
                </div>
                <Input
                  label="Amount ($)"
                  name="additional_line_1_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={formatAmount(customer?.additional_line_1_amount)}
                  placeholder="0.00"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                  <Input
                    label="Additional Item 2 Description"
                    name="additional_line_2_desc"
                    defaultValue={customer?.additional_line_2_desc || ''}
                    placeholder="e.g., Physical Therapy"
                  />
                </div>
                <Input
                  label="Amount ($)"
                  name="additional_line_2_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={formatAmount(customer?.additional_line_2_amount)}
                  placeholder="0.00"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                  <Input
                    label="Additional Item 3 Description"
                    name="additional_line_3_desc"
                    defaultValue={customer?.additional_line_3_desc || ''}
                    placeholder="e.g., Transportation"
                  />
                </div>
                <Input
                  label="Amount ($)"
                  name="additional_line_3_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={formatAmount(customer?.additional_line_3_amount)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            name="notes"
            className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="Internal notes about this resident..."
            defaultValue={customer?.notes || ''}
          />
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : mode === 'create' ? 'Create Resident' : 'Save Changes'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
