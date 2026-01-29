import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, subMonths, startOfMonth, addMonths, setDate } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMMM d, yyyy');
}

export function formatMonthYear(date: string | Date): string {
  return format(new Date(date), 'MMMM yyyy');
}

// Calculate invoice dates based on the business logic:
// - Service month: Previous month (e.g., January)
// - Invoice date: 1st of current month (e.g., February 1)
// - Due date: 15th of current month (e.g., February 15)
export function calculateInvoiceDates(referenceDate: Date = new Date()) {
  const serviceMonth = startOfMonth(subMonths(referenceDate, 1));
  const invoiceDate = startOfMonth(referenceDate);
  const dueDate = setDate(referenceDate, 15);

  return {
    serviceMonth,
    invoiceDate,
    dueDate,
    // Formatted versions for display
    serviceMonthFormatted: format(serviceMonth, 'MMMM yyyy'),
    invoiceDateFormatted: format(invoiceDate, 'MMMM d, yyyy'),
    dueDateFormatted: format(dueDate, 'MMMM d, yyyy'),
    // ISO dates for database
    serviceMonthISO: format(serviceMonth, 'yyyy-MM-dd'),
    invoiceDateISO: format(invoiceDate, 'yyyy-MM-dd'),
    dueDateISO: format(dueDate, 'yyyy-MM-dd'),
  };
}

// Calculate total from monthly rate and additional lines
export function calculateInvoiceTotal(
  monthlyRate: number,
  line1Amount?: number | null,
  line2Amount?: number | null,
  line3Amount?: number | null
): number {
  return (
    monthlyRate +
    (line1Amount || 0) +
    (line2Amount || 0) +
    (line3Amount || 0)
  );
}

// Generate invoice number in format CGAR-YYYY-NNN
export function formatInvoiceNumber(year: number, sequence: number): string {
  return `CGAR-${year}-${String(sequence).padStart(3, '0')}`;
}
