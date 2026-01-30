import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatMonthYear } from '@/lib/utils';
import {
  Users,
  FileText,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { format, startOfMonth, subMonths, parseISO, isBefore } from 'date-fns';

export default async function DashboardPage() {
  const supabase = await createClient();
  const today = new Date();
  const currentMonth = format(startOfMonth(today), 'yyyy-MM-dd');

  // Get all data in parallel
  const [
    customersResult,
    activeCustomersResult,
    invoicesResult,
    unpaidInvoicesResult,
    allInvoicesData,
    activeCustomersData,
  ] = await Promise.all([
    supabase.from('customers').select('id', { count: 'exact', head: true }),
    supabase.from('customers').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('invoices').select('id', { count: 'exact', head: true }),
    supabase.from('invoices').select('id', { count: 'exact', head: true }).neq('status', 'paid'),
    supabase.from('invoices').select('*').order('created_at', { ascending: false }),
    supabase.from('customers').select('*').eq('is_active', true),
  ]);

  const totalCustomers = customersResult.count || 0;
  const activeCustomers = activeCustomersResult.count || 0;
  const totalInvoices = invoicesResult.count || 0;
  const unpaidInvoices = unpaidInvoicesResult.count || 0;
  const allInvoices = allInvoicesData.data || [];
  const activeResidents = activeCustomersData.data || [];

  // Calculate outstanding balance (total unpaid amount)
  const outstandingBalance = allInvoices
    .filter((inv) => inv.status !== 'paid')
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  // Calculate expected monthly revenue (sum of all active residents' monthly totals)
  const expectedMonthlyRevenue = activeResidents.reduce((sum, customer) => {
    const dailyTotal = (customer.daily_rate || 0) * (customer.daily_rate_days || 0);
    return (
      sum +
      customer.monthly_rate +
      dailyTotal +
      (customer.additional_line_1_amount || 0) +
      (customer.additional_line_2_amount || 0) +
      (customer.additional_line_3_amount || 0)
    );
  }, 0);

  // Get overdue invoices (unpaid and past due date)
  const overdueInvoices = allInvoices.filter(
    (inv) => inv.status !== 'paid' && isBefore(parseISO(inv.due_date), today)
  );

  // Get recent invoices (last 5)
  const recentInvoices = allInvoices.slice(0, 5);

  // Calculate revenue by month (last 6 months)
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(today, 5 - i);
    return format(startOfMonth(date), 'yyyy-MM-dd');
  });

  const revenueByMonth = last6Months.map((month) => {
    const monthInvoices = allInvoices.filter((inv) => inv.service_month === month);
    const total = monthInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
    const paid = monthInvoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total_amount, 0);
    return {
      month,
      label: format(parseISO(month), 'MMM yyyy'),
      shortLabel: format(parseISO(month), 'MMM'),
      total,
      paid,
      unpaid: total - paid,
    };
  });

  // Find the max for scaling the chart
  const maxRevenue = Math.max(...revenueByMonth.map((m) => m.total), 1);

  // Get residents who haven't been invoiced this month
  const invoicedCustomerIds = new Set(
    allInvoices.filter((inv) => inv.service_month === currentMonth).map((inv) => inv.customer_id)
  );
  const residentsNeedingInvoices = activeResidents.filter(
    (customer) => !invoicedCustomerIds.has(customer.id)
  );

  // Collection rate
  const paidInvoices = allInvoices.filter((inv) => inv.status === 'paid').length;
  const collectionRate = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to the Resident Invoicing System</p>
        </div>
        <Link href="/invoices/generate">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Generate Invoices
          </Button>
        </Link>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Active Residents</CardTitle>
            <Users className="h-4 w-4 text-blue-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCustomers}</div>
            <p className="text-xs text-gray-500">of {totalCustomers} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Expected Monthly</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(expectedMonthlyRevenue)}
            </div>
            <p className="text-xs text-gray-500">from active residents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(outstandingBalance)}
            </div>
            <p className="text-xs text-gray-500">{unpaidInvoices} unpaid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{overdueInvoices.length}</div>
            <p className="text-xs text-gray-500">past due date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Collection Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectionRate}%</div>
            <p className="text-xs text-gray-500">{paidInvoices} of {totalInvoices} paid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-blue-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-gray-500">all time</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart - Takes 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Revenue by Month (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revenueByMonth.map((month) => (
                <div key={month.month} className="flex items-center gap-3">
                  <div className="w-16 text-sm text-gray-600">{month.shortLabel}</div>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden flex">
                    {month.total > 0 ? (
                      <>
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${(month.paid / maxRevenue) * 100}%` }}
                          title={`Paid: ${formatCurrency(month.paid)}`}
                        />
                        <div
                          className="h-full bg-red-400"
                          style={{ width: `${(month.unpaid / maxRevenue) * 100}%` }}
                          title={`Unpaid: ${formatCurrency(month.unpaid)}`}
                        />
                      </>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">
                        No invoices
                      </div>
                    )}
                  </div>
                  <div className="w-24 text-sm text-right font-medium">
                    {formatCurrency(month.total)}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-4 pt-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  Paid
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-400 rounded" />
                  Unpaid
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Needs Invoicing This Month */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Needs Invoicing
              </CardTitle>
              <span className="text-xs text-gray-500">{format(today, 'MMMM yyyy')}</span>
            </div>
          </CardHeader>
          <CardContent>
            {residentsNeedingInvoices.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-3">
                  {residentsNeedingInvoices.length} resident
                  {residentsNeedingInvoices.length === 1 ? '' : 's'} not yet invoiced
                </p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {residentsNeedingInvoices.slice(0, 5).map((customer) => (
                    <div
                      key={customer.id}
                      className="text-sm py-1 px-2 bg-yellow-50 rounded text-yellow-800"
                    >
                      {customer.first_name} {customer.last_name}
                    </div>
                  ))}
                  {residentsNeedingInvoices.length > 5 && (
                    <p className="text-xs text-gray-500 pt-1">
                      +{residentsNeedingInvoices.length - 5} more
                    </p>
                  )}
                </div>
                <Link href="/invoices/generate" className="block pt-2">
                  <Button size="sm" className="w-full">
                    <Plus className="w-3 h-3 mr-1" />
                    Generate Now
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">All residents invoiced!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Invoices */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                Overdue Invoices
              </CardTitle>
              {overdueInvoices.length > 0 && (
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                  {overdueInvoices.length} overdue
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {overdueInvoices.length > 0 ? (
              <div className="space-y-2">
                {overdueInvoices.slice(0, 5).map((invoice) => (
                  <Link
                    key={invoice.id}
                    href={`/invoices/${invoice.id}`}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{invoice.customer_name}</p>
                      <p className="text-xs text-gray-500">
                        {invoice.invoice_number} • Due {format(parseISO(invoice.due_date), 'MMM d')}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-red-600">
                      {formatCurrency(invoice.total_amount)}
                    </div>
                  </Link>
                ))}
                {overdueInvoices.length > 5 && (
                  <Link
                    href="/invoices?status=unpaid"
                    className="flex items-center justify-center gap-1 text-sm text-blue-900 hover:text-blue-700 pt-2"
                  >
                    View all {overdueInvoices.length} overdue
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No overdue invoices!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Recent Invoices
              </CardTitle>
              <Link
                href="/invoices"
                className="text-xs text-blue-900 hover:text-blue-700 flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentInvoices.length > 0 ? (
              <div className="space-y-2">
                {recentInvoices.map((invoice) => (
                  <Link
                    key={invoice.id}
                    href={`/invoices/${invoice.id}`}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{invoice.customer_name}</p>
                      <p className="text-xs text-gray-500">
                        {invoice.invoice_number} • {formatMonthYear(invoice.service_month)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.total_amount)}
                      </span>
                      {invoice.status === 'paid' ? (
                        <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                          Paid
                        </span>
                      ) : (
                        <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                          Unpaid
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No invoices yet</p>
                <Link href="/invoices/generate" className="mt-2 inline-block">
                  <Button size="sm" variant="outline">
                    Generate First Invoices
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
