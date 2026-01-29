import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, startOfMonth, addMonths, setDate, parseISO } from 'date-fns';

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
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMMM d, yyyy');
}

export function formatMonthYear(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMMM yyyy');
}

// Calculate invoice dates based on the business logic:
// - Service month: Current month (e.g., January if generating in January)
// - Invoice date: Today's date
// - Due date: 15th of next month (e.g., February 15)
export function calculateInvoiceDates(referenceDate: Date = new Date()) {
  const serviceMonth = startOfMonth(referenceDate);
  const invoiceDate = referenceDate;
  const dueDate = setDate(addMonths(referenceDate, 1), 15);

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

// Calculate total from monthly rate, daily rate, and additional lines
export function calculateInvoiceTotal(
  monthlyRate: number,
  line1Amount?: number | null,
  line2Amount?: number | null,
  line3Amount?: number | null,
  dailyRate?: number | null,
  dailyRateDays?: number | null
): number {
  const dailyTotal = (dailyRate || 0) * (dailyRateDays || 0);
  return (
    monthlyRate +
    dailyTotal +
    (line1Amount || 0) +
    (line2Amount || 0) +
    (line3Amount || 0)
  );
}

// Generate invoice number in format CGAR-YYYY-NNN
export function formatInvoiceNumber(year: number, sequence: number): string {
  return `CGAR-${year}-${String(sequence).padStart(3, '0')}`;
}
