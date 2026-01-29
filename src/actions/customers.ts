'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { CustomerInsert, CustomerUpdate } from '@/lib/supabase/types';

export async function createCustomer(data: CustomerInsert) {
  const supabase = await createClient();

  const { error } = await supabase.from('customers').insert(data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/customers');
  redirect('/customers');
}

export async function updateCustomer(id: string, data: CustomerUpdate) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('customers')
    .update(data)
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/customers');
  revalidatePath(`/customers/${id}`);
  redirect('/customers');
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('customers').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/customers');
  redirect('/customers');
}

export async function toggleCustomerActive(id: string, isActive: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('customers')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/customers');
  revalidatePath(`/customers/${id}`);
  return { success: true };
}

export async function getCustomer(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function getCustomers(filter: 'all' | 'active' | 'inactive' = 'all') {
  const supabase = await createClient();

  let query = supabase.from('customers').select('*').order('name');

  if (filter === 'active') {
    query = query.eq('is_active', true);
  } else if (filter === 'inactive') {
    query = query.eq('is_active', false);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message };
  }

  return { data };
}

// Update a single customer's name fields
export async function updateCustomerNameFields(
  id: string,
  firstName: string,
  middleName: string | null,
  lastName: string
) {
  const supabase = await createClient();

  const fullName = middleName
    ? `${firstName} ${middleName} ${lastName}`
    : `${firstName} ${lastName}`;

  const { error } = await supabase
    .from('customers')
    .update({
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      name: fullName,
    })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/customers');
  revalidatePath(`/customers/${id}`);
  return { success: true };
}
