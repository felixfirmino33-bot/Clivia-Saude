export type UserRole = 'patient' | 'clinic_admin' | 'staff' | 'admin';
export type ClinicStatus = 'pending' | 'verified' | 'rejected' | 'suspended';
export type SlotStatus = 'open' | 'held' | 'booked' | 'cancelled';
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  phone?: string | null;
}

export interface Clinic {
  id: string;
  owner_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  status: ClinicStatus;
  phone: string | null;
  whatsapp: string | null;
  created_at: string;
}

export interface ClinicLocation {
  id: string;
  clinic_id: string;
  address: string | null;
  province: string;
  municipality: string | null;
  neighborhood: string | null;
  latitude: number;
  longitude: number;
}

export interface ClinicImage {
  id: string;
  clinic_id: string;
  url: string;
  is_cover: boolean;
}

export interface Specialty {
  id: string;
  name: string;
}

export interface ServiceItem {
  id: string;
  specialty_id: string | null;
  name: string;
}

export interface ClinicService {
  id: string;
  clinic_id: string;
  service_id: string;
  price: number;
  currency: string;
  service?: ServiceItem;
  specialty?: Specialty;
}

export interface Doctor {
  id: string;
  clinic_id: string;
  full_name: string;
  specialty_id: string | null;
  specialty?: Specialty;
}

export interface DoctorSlot {
  id: string;
  doctor_id: string;
  clinic_id: string;
  starts_at: string;
  ends_at: string;
  status: SlotStatus;
  doctor?: Doctor;
  clinic?: Clinic;
}

export interface Appointment {
  id: string;
  patient_id: string | null;
  clinic_id: string;
  doctor_id: string | null;
  service_id: string | null;
  slot_id: string;
  status: AppointmentStatus;
  patient_name?: string | null;
  patient_phone?: string | null;
  notes?: string | null;
  created_at: string;
  clinic?: Clinic;
  doctor?: Doctor;
  service?: ServiceItem;
  slot?: DoctorSlot;
}

export interface Review {
  id: string;
  appointment_id: string;
  patient_id: string;
  clinic_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  patient_name?: string;
}

export interface ClinicWithDetails extends Clinic {
  location?: ClinicLocation;
  images: ClinicImage[];
  services: ClinicService[];
  doctors: Doctor[];
  reviews: Review[];
  ratingAverage: number;
  reviewsCount: number;
  minPrice?: number;
  distanceKm?: number;
}
