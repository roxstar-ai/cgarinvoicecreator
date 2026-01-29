'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { FacilitySettingsUpdate } from '@/lib/supabase/types';

export async function updateFacilitySettings(data: FacilitySettingsUpdate) {
  const supabase = await createClient();

  // Get the existing settings ID first
  const { data: existing } = await supabase
    .from('facility_settings')
    .select('id')
    .single();

  if (!existing) {
    return { error: 'Facility settings not found' };
  }

  const { error } = await supabase
    .from('facility_settings')
    .update(data)
    .eq('id', existing.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/settings');
  revalidatePath('/invoices');
  return { success: true };
}

export async function getFacilitySettings() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('facility_settings')
    .select('*')
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}
