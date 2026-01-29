'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { calculateInvoiceTotal } from '@/lib/utils';
import type { Customer, InvoiceUpdate } from '@/lib/supabase/types';

export interface GenerateInvoicesParams {
  serviceMonth: string;
  invoiceDate: string;
  dueDate: string;
  customerIds: string[];
}

export async function generateInvoices(params: GenerateInvoicesParams) {
  const supabase = await createClient();

  // Get the selected customers
  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select('*')
    .in('id', params.customerIds)
    .eq('is_active', true);

  if (customersError) {
    return { error: customersError.message };
  }

  if (!customers || customers.length === 0) {
    return { error: 'No active customers found' };
  }

  // Generate invoice number for each customer
  const year = new Date(params.invoiceDate).getFullYear();

  const invoices = [];
  for (const customer of customers) {
    // Check if invoice already exists for this customer and service month
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('customer_id', customer.id)
      .eq('service_month', params.serviceMonth)
      .single();

    if (existingInvoice) {
      // Skip if invoice already exists
      continue;
    }

    // Generate invoice number using the database function
    const { data: invoiceNumber, error: numberError } = await supabase
      .rpc('generate_invoice_number', { p_year: year });

    if (numberError) {
      return { error: `Failed to generate invoice number: ${numberError.message}` };
    }

    const dailyRateTotal = (customer.daily_rate || 0) * (customer.daily_rate_days || 0);

    const total = calculateInvoiceTotal(
      customer.monthly_rate,
      customer.additional_line_1_amount,
      customer.additional_line_2_amount,
      customer.additional_line_3_amount,
      customer.daily_rate,
      customer.daily_rate_days
    );

    invoices.push({
      customer_id: customer.id,
      invoice_number: invoiceNumber,
      service_month: params.serviceMonth,
      invoice_date: params.invoiceDate,
      due_date: params.dueDate,
      customer_name: customer.name,
      customer_address: customer.address,
      customer_city_state_zip: customer.city_state_zip,
      monthly_rate: customer.monthly_rate,
      daily_rate: customer.daily_rate,
      daily_rate_days: customer.daily_rate_days,
      daily_rate_total: dailyRateTotal > 0 ? dailyRateTotal : null,
      line_1_desc: customer.additional_line_1_desc,
      line_1_amount: customer.additional_line_1_amount,
      line_2_desc: customer.additional_line_2_desc,
      line_2_amount: customer.additional_line_2_amount,
      line_3_desc: customer.additional_line_3_desc,
      line_3_amount: customer.additional_line_3_amount,
      total_amount: total,
      status: 'draft' as const,
    });
  }

  if (invoices.length === 0) {
    return { error: 'All invoices already exist for this service month' };
  }

  // Insert all invoices
  const { error: insertError } = await supabase
    .from('invoices')
    .insert(invoices);

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath('/invoices');
  revalidatePath('/');

  return { success: true, count: invoices.length };
}

export async function updateInvoiceStatus(id: string, status: 'draft' | 'sent' | 'paid') {
  const supabase = await createClient();

  const { error } = await supabase
    .from('invoices')
    .update({ status })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/invoices');
  revalidatePath(`/invoices/${id}`);
  return { success: true };
}

export async function deleteInvoice(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('invoices').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/invoices');
  revalidatePath('/');
  return { success: true };
}

export async function getInvoice(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function getActiveCustomersForInvoicing() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    return { error: error.message };
  }

  return { data };
}
