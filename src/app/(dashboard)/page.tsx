import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, Plus, Printer } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get stats
  const [customersResult, activeCustomersResult, invoicesResult, draftInvoicesResult] = await Promise.all([
    supabase.from('customers').select('id', { count: 'exact', head: true }),
    supabase.from('customers').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('invoices').select('id', { count: 'exact', head: true }),
    supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
  ]);

  const totalCustomers = customersResult.count || 0;
  const activeCustomers = activeCustomersResult.count || 0;
  const totalInvoices = invoicesResult.count || 0;
  const draftInvoices = draftInvoicesResult.count || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to the CGAR Invoice Management System</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Residents
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCustomers}</div>
            <p className="text-xs text-gray-700">of {totalCustomers} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Invoices
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-gray-700">all time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Draft Invoices
            </CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftInvoices}</div>
            <p className="text-xs text-gray-700">pending review</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you can perform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/invoices/generate">
              <Button className="w-full h-auto py-4 flex flex-col items-center gap-2">
                <Printer className="h-6 w-6" />
                <span>Generate Invoices</span>
              </Button>
            </Link>
            <Link href="/customers/new">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                <Plus className="h-6 w-6" />
                <span>Add Resident</span>
              </Button>
            </Link>
            <Link href="/customers">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                <Users className="h-6 w-6" />
                <span>View Residents</span>
              </Button>
            </Link>
            <Link href="/invoices">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                <FileText className="h-6 w-6" />
                <span>View Invoices</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
