import { ClinicWithDetails, ServiceItem, Specialty, UserRole } from './database';

export * from './database';

export type AppView = 
  | { type: 'home' }
  | { type: 'search'; serviceId?: string; specialtyId?: string; municipality?: string; query?: string }
  | { type: 'clinic'; slug: string }
  | { type: 'booking'; clinicId: string; serviceId?: string; doctorId?: string }
  | { type: 'patient-portal' }
  | { type: 'clinic-portal' }
  | { type: 'admin-portal' }
  | { type: 'auth'; mode: 'login' | 'register'; intendedRole?: UserRole };

export interface SearchFilterState {
  searchQuery: string;
  selectedServiceId: string | null;
  selectedSpecialtyId: string | null;
  municipality: string | null;
  neighborhood: string | null;
  maxPrice: number | null;
  sortBy: 'recommended' | 'distance' | 'price_asc' | 'rating';
  userLat?: number | null;
  userLng?: number | null;
}

export interface WhatsAppNotificationPayload {
  toPhone: string;
  clinicName: string;
  patientName: string;
  serviceName: string;
  doctorName?: string;
  appointmentTime: string;
  appointmentDate: string;
  clinicAddress: string;
  priceAOA: number;
}
