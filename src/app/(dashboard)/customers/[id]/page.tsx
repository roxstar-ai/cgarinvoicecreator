import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomerInvoiceHistory } from '@/components/customers/customer-invoice-history';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, Edit, FileText, User, MapPin, Phone, Mail, DollarSign } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewCustomerPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (customerError || !customer) {
    notFound();
  }

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('customer_id', id)
    .order('service_month', { ascending: false });

  const getDisplayName = () => {
    if (customer.first_name && customer.last_name) {
      return customer.middle_name
        ? `${customer.first_name} ${customer.middle_name} ${customer.last_name}`
        : `${customer.first_name} ${customer.last_name}`;
    }
    return customer.name;
  };

  const dailyTotal = (customer.daily_rate || 0) * (customer.daily_rate_days || 0);
  const monthlyTotal =
    customer.monthly_rate +
    dailyTotal +
    (customer.additional_line_1_amount || 0) +
    (customer.additional_line_2_amount || 0) +
    (customer.additional_line_3_amount || 0);

  const paidInvoices = invoices?.filter((inv) => inv.status === 'paid') || [];
  const unpaidInvoices = invoices?.filter((inv) => inv.status !== 'paid') || [];
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/customers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{getDisplayName()}</h1>
              {!customer.is_active && (
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-gray-600">Resident Profile</p>
          </div>
        </div>
        <Link href={`/customers/${id}/edit`}>
          <Button>
            <Edit className="w-4 h-4 mr-2" />
            Edit Resident
          </Button>
        </Link>
      </div>

      {/* Customer Info and Billing Summary - Condensed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Contact Information */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-4 h-4" />
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {customer.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-3 h-3 text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-900">{customer.address}</p>
                  {customer.city_state_zip && <p className="text-gray-900">{customer.city_state_zip}</p>}
                </div>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <p className="text-gray-900">{customer.phone}</p>
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <p className="text-gray-900">{customer.email}</p>
              </div>
            )}
            {customer.responsible_first_name && (
              <div className="pt-1 border-t text-xs text-gray-500">
                Responsible: {customer.responsible_first_name} {customer.responsible_last_name}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billing - Compact with full breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="w-4 h-4" />
              Billing
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="space-y-0.5">
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Rate</span>
                <span className="text-gray-900">{formatCurrency(customer.monthly_rate)}</span>
              </div>
              {dailyTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily ({customer.daily_rate_days}d × {formatCurrency(customer.daily_rate || 0)})</span>
                  <span className="text-gray-900">{formatCurrency(dailyTotal)}</span>
                </div>
              )}
              {customer.additional_line_1_amount && customer.additional_line_1_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{customer.additional_line_1_desc || 'Item 1'}</span>
                  <span className="text-gray-900">{formatCurrency(customer.additional_line_1_amount)}</span>
                </div>
              )}
              {customer.additional_line_2_amount && customer.additional_line_2_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{customer.additional_line_2_desc || 'Item 2'}</span>
                  <span className="text-gray-900">{formatCurrency(customer.additional_line_2_amount)}</span>
                </div>
              )}
              {customer.additional_line_3_amount && customer.additional_line_3_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{customer.additional_line_3_desc || 'Item 3'}</span>
                  <span className="text-gray-900">{formatCurrency(customer.additional_line_3_amount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 mt-1 border-t font-medium">
                <span>Monthly Total</span>
                <span>{formatCurrency(monthlyTotal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Summary - Compact */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="w-4 h-4" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="space-y-0.5">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Invoices</span>
                <span className="text-gray-900">{invoices?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paid</span>
                <span className="text-green-600">{formatCurrency(totalPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unpaid</span>
                <span className="text-red-600">{formatCurrency(totalUnpaid)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes if present */}
      {customer.notes && (
        <Card>
          <CardContent className="py-3">
            <p className="text-sm text-gray-500 mb-1">Notes</p>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{customer.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Invoice History */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4" />
            Invoice History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {invoices && invoices.length > 0 ? (
            <CustomerInvoiceHistory invoices={invoices} />
          ) : (
            <div className="py-8 text-center">
              <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">No invoices found for this resident.</p>
              <Link href="/invoices/generate" className="mt-2 inline-block">
                <Button variant="outline" size="sm">
                  Generate Invoices
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
