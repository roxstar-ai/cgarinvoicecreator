'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { updateFacilitySettings } from '@/actions/settings';
import type { FacilitySettings } from '@/lib/supabase/types';
import { CheckCircle, Loader2 } from 'lucide-react';

interface SettingsFormProps {
  settings: FacilitySettings | null;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);

    const data = {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      city_state_zip: formData.get('city_state_zip') as string,
      phone: formData.get('phone') as string || null,
      fax: formData.get('fax') as string || null,
      website: formData.get('website') as string || null,
      email: formData.get('email') as string || null,
      thank_you_note: formData.get('thank_you_note') as string || null,
    };

    const result = await updateFacilitySettings(data);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Settings saved successfully!
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Facility Information</CardTitle>
          <CardDescription>
            This information appears at the top of all invoices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Facility Name"
            name="name"
            defaultValue={settings?.name || ''}
            required
            placeholder="Carroll Golden Age Retreat"
          />
          <Input
            label="Street Address"
            name="address"
            defaultValue={settings?.address || ''}
            required
            placeholder="2202 Kensington Road NE"
          />
          <Input
            label="City, State ZIP"
            name="city_state_zip"
            defaultValue={settings?.city_state_zip || ''}
            required
            placeholder="Carrollton, OH 44615"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone"
              name="phone"
              type="tel"
              defaultValue={settings?.phone || ''}
              placeholder="330-627-4665"
            />
            <Input
              label="Fax"
              name="fax"
              type="tel"
              defaultValue={settings?.fax || ''}
              placeholder="330-627-7772"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Website"
              name="website"
              type="text"
              defaultValue={settings?.website || ''}
              placeholder="www.carrollgoldenageretreat.com"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              defaultValue={settings?.email || ''}
              placeholder="info@carrollgar.org"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Footer</CardTitle>
          <CardDescription>
            This message appears at the bottom of all invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Thank You Note
          </label>
          <textarea
            name="thank_you_note"
            className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="Thank you for choosing Carroll Golden Age Retreat..."
            defaultValue={settings?.thank_you_note || ''}
          />
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>
    </form>
  );
}
