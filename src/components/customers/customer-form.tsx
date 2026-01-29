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

export function CustomerForm({ customer, mode }: CustomerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const data = {
      name: formData.get('name') as string,
      address: formData.get('address') as string || null,
      city_state_zip: formData.get('city_state_zip') as string || null,
      phone: formData.get('phone') as string || null,
      email: formData.get('email') as string || null,
      monthly_rate: parseFloat(formData.get('monthly_rate') as string) || 0,
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
          <Input
            label="Full Name"
            name="name"
            defaultValue={customer?.name}
            required
            placeholder="John Doe"
          />
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
          <CardTitle>Monthly Rate & Additional Charges</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Monthly Care Rate ($)"
            name="monthly_rate"
            type="number"
            step="0.01"
            min="0"
            defaultValue={customer?.monthly_rate || ''}
            required
            placeholder="0.00"
          />

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
                  defaultValue={customer?.additional_line_1_amount || ''}
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
                  defaultValue={customer?.additional_line_2_amount || ''}
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
                  defaultValue={customer?.additional_line_3_amount || ''}
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
