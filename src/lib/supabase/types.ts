// Re-export the generated database types
export type { Database } from './database.types';

import type { Database } from './database.types';

// Convenience types for the tables
export type FacilitySettings = Database['public']['Tables']['facility_settings']['Row'];
export type FacilitySettingsInsert = Database['public']['Tables']['facility_settings']['Insert'];
export type FacilitySettingsUpdate = Database['public']['Tables']['facility_settings']['Update'];

export type Customer = Database['public']['Tables']['customers']['Row'];
export type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
export type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

export type Invoice = Database['public']['Tables']['invoices']['Row'];
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];
export type InvoiceUpdate = Database['public']['Tables']['invoices']['Update'];
