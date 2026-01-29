'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate, formatMonthYear } from '@/lib/utils';
import type { Invoice, FacilitySettings } from '@/lib/supabase/types';
import { ArrowLeft, Printer } from 'lucide-react';

interface InvoicePrintViewProps {
  invoice: Invoice;
  facility: FacilitySettings | null;
}

export function InvoicePrintView({ invoice, facility }: InvoicePrintViewProps) {
  const router = useRouter();

  const handlePrint = () => {
    window.print();
  };

  const lineItems = [
    { desc: 'Monthly Care Services', amount: invoice.monthly_rate },
    invoice.line_1_desc && invoice.line_1_amount
      ? { desc: invoice.line_1_desc, amount: invoice.line_1_amount }
      : null,
    invoice.line_2_desc && invoice.line_2_amount
      ? { desc: invoice.line_2_desc, amount: invoice.line_2_amount }
      : null,
    invoice.line_3_desc && invoice.line_3_amount
      ? { desc: invoice.line_3_desc, amount: invoice.line_3_amount }
      : null,
  ].filter(Boolean) as { desc: string; amount: number }[];

  return (
    <>
      {/* Screen Controls - Hidden when printing */}
      <div className="print:hidden mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print Invoice
        </Button>
      </div>

      {/* Invoice Content - Optimized for printing */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 print:shadow-none print:border-none">
        <div className="p-8 print:p-0">
          {/* Header */}
          <div className="border-b border-gray-200 pb-6 mb-6 print:border-b print:border-gray-300">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {facility?.name || 'Carroll Golden Age Retreat'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {facility?.address || '2202 Kensington Road NE'}
                </p>
                <p className="text-gray-600">
                  {facility?.city_state_zip || 'Carrollton, OH 44615'}
                </p>
                <div className="mt-2 text-sm text-gray-700">
                  {facility?.phone && <p>Phone: {facility.phone}</p>}
                  {facility?.fax && <p>Fax: {facility.fax}</p>}
                  {facility?.website && <p>{facility.website}</p>}
                  {facility?.email && <p>{facility.email}</p>}
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-gray-900">INVOICE</h2>
                <p className="text-lg font-semibold text-blue-600 mt-1">
                  {invoice.invoice_number}
                </p>
              </div>
            </div>
          </div>

          {/* Bill To & Invoice Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">
                Bill To
              </h3>
              <p className="text-lg font-medium text-gray-900">
                {invoice.customer_name}
              </p>
              {invoice.customer_address && (
                <p className="text-gray-600">{invoice.customer_address}</p>
              )}
              {invoice.customer_city_state_zip && (
                <p className="text-gray-600">{invoice.customer_city_state_zip}</p>
              )}
            </div>
            <div className="text-right">
              <div className="inline-block text-left">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span className="text-gray-700">Service Month:</span>
                  <span className="font-medium">{formatMonthYear(invoice.service_month)}</span>
                  <span className="text-gray-700">Invoice Date:</span>
                  <span className="font-medium">{formatDate(invoice.invoice_date)}</span>
                  <span className="text-gray-700">Due Date:</span>
                  <span className="font-medium text-red-600">{formatDate(invoice.due_date)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-8 print:border-gray-300">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 print:bg-gray-100">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 w-32">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lineItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-gray-700">{item.desc}</td>
                    <td className="px-4 py-3 text-right text-gray-900 font-medium">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 print:bg-gray-100">
                  <td className="px-4 py-4 text-right font-bold text-gray-900">
                    Total Due:
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-xl text-blue-600">
                    {formatCurrency(invoice.total_amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Instructions */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 print:bg-gray-100">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Please remit payment by {formatDate(invoice.due_date)}</span>
              <br />
              Make checks payable to: {facility?.name || 'Carroll Golden Age Retreat'}
            </p>
          </div>

          {/* Thank You Note */}
          {facility?.thank_you_note && (
            <div className="text-center pt-6 border-t border-gray-200 print:border-gray-300">
              <p className="text-gray-600 italic">{facility.thank_you_note}</p>
            </div>
          )}
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .bg-white.rounded-lg,
          .bg-white.rounded-lg * {
            visibility: visible;
          }
          .bg-white.rounded-lg {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            margin: 0.75in;
            size: letter;
          }
        }
      `}</style>
    </>
  );
}
