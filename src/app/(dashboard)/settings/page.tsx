import { createClient } from '@/lib/supabase/server';
import { SettingsForm } from '@/components/settings/settings-form';

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from('facility_settings')
    .select('*')
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage facility information displayed on invoices</p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}
