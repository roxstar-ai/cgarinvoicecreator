'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updateCustomerNameFields } from '@/actions/customers';
import { CheckCircle, ArrowLeft, Save, Loader2 } from 'lucide-react';

interface CustomerToUpdate {
  id: string;
  name: string;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
}

export default function UpdateNamesPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerToUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<Record<string, { first: string; middle: string; last: string }>>({});

  useEffect(() => {
    const fetchCustomers = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('customers')
        .select('id, name, first_name, middle_name, last_name')
        .order('name');

      if (data) {
        setCustomers(data);
        // Initialize form data - try to split existing name
        const initialData: Record<string, { first: string; middle: string; last: string }> = {};
        data.forEach((customer) => {
          if (customer.first_name && customer.last_name) {
            // Already has split names
            initialData[customer.id] = {
              first: customer.first_name,
              middle: customer.middle_name || '',
              last: customer.last_name,
            };
          } else {
            // Try to auto-split the name
            const parts = (customer.name || '').trim().split(/\s+/);
            if (parts.length === 1) {
              initialData[customer.id] = { first: parts[0], middle: '', last: '' };
            } else if (parts.length === 2) {
              initialData[customer.id] = { first: parts[0], middle: '', last: parts[1] };
            } else {
              // Assume first + middle(s) + last
              initialData[customer.id] = {
                first: parts[0],
                middle: parts.slice(1, -1).join(' '),
                last: parts[parts.length - 1],
              };
            }
          }
        });
        setFormData(initialData);
      }
      setLoading(false);
    };

    fetchCustomers();
  }, []);

  const handleSave = async (customerId: string) => {
    const data = formData[customerId];
    if (!data.first || !data.last) {
      alert('First name and last name are required');
      return;
    }

    setSaving(customerId);
    const result = await updateCustomerNameFields(
      customerId,
      data.first.trim(),
      data.middle.trim() || null,
      data.last.trim()
    );

    if (result.success) {
      setSaved((prev) => new Set([...prev, customerId]));
    } else {
      alert(result.error || 'Failed to save');
    }
    setSaving(null);
  };

  const handleSaveAll = async () => {
    for (const customer of customers) {
      if (!saved.has(customer.id)) {
        await handleSave(customer.id);
      }
    }
  };

  const updateField = (id: string, field: 'first' | 'middle' | 'last', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
    // Remove from saved if edited
    if (saved.has(id)) {
      setSaved((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const needsUpdate = customers.filter((c) => !c.first_name || !c.last_name);
  const alreadyUpdated = customers.filter((c) => c.first_name && c.last_name);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Update Resident Names</h1>
          <p className="text-gray-600">
            Split full names into First, Middle, and Last name fields
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/customers')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Residents
          </Button>
          {needsUpdate.length > 0 && (
            <Button onClick={handleSaveAll}>
              <Save className="w-4 h-4 mr-2" />
              Save All
            </Button>
          )}
        </div>
      </div>

      {needsUpdate.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              All names are up to date!
            </h3>
            <p className="text-gray-600">
              All {customers.length} residents have their names properly split.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm text-gray-700">
            {needsUpdate.length} resident{needsUpdate.length === 1 ? '' : 's'} need name updates.
            {alreadyUpdated.length > 0 && ` ${alreadyUpdated.length} already updated.`}
          </p>

          <div className="space-y-4">
            {needsUpdate.map((customer) => (
              <Card key={customer.id} className={saved.has(customer.id) ? 'border-green-300 bg-green-50' : ''}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    Current: {customer.name}
                    {saved.has(customer.id) && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <Input
                      label="First Name"
                      value={formData[customer.id]?.first || ''}
                      onChange={(e) => updateField(customer.id, 'first', e.target.value)}
                      placeholder="First"
                    />
                    <Input
                      label="Middle Name"
                      value={formData[customer.id]?.middle || ''}
                      onChange={(e) => updateField(customer.id, 'middle', e.target.value)}
                      placeholder="Middle (optional)"
                    />
                    <Input
                      label="Last Name"
                      value={formData[customer.id]?.last || ''}
                      onChange={(e) => updateField(customer.id, 'last', e.target.value)}
                      placeholder="Last"
                    />
                    <Button
                      onClick={() => handleSave(customer.id)}
                      disabled={saving === customer.id || saved.has(customer.id)}
                      className="h-10"
                    >
                      {saving === customer.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : saved.has(customer.id) ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
