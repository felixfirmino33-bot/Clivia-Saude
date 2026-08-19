import { createClient } from '@supabase/supabase-js';
import { 
  ClinicWithDetails, 
  Specialty, 
  ServiceItem, 
  Doctor, 
  DoctorSlot, 
  Appointment, 
  Review, 
  ClinicStatus, 
  UserRole, 
  Profile 
} from '../../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Initial Initialized Seed Store for Luanda
const INITIAL_SPECIALTIES: Specialty[] = [
  { id: 'spec-1', name: 'Cardiologia' },
  { id: 'spec-2', name: 'Clínica Geral' },
  { id: 'spec-3', name: 'Pediatria' },
  { id: 'spec-4', name: 'Ginecologia e Obstetrícia' },
  { id: 'spec-5', name: 'Dermatologia' },
  { id: 'spec-6', name: 'Oftalmologia' },
  { id: 'spec-7', name: 'Ortopedia' },
  { id: 'spec-8', name: 'Estomatologia (Dentista)' },
  { id: 'spec-9', name: 'Neurologia' },
];

const INITIAL_SERVICES: ServiceItem[] = [
  { id: 'srv-1', specialty_id: 'spec-1', name: 'ECG (Eletrocardiograma)' },
  { id: 'srv-2', specialty_id: 'spec-1', name: 'Ecocardiograma Transtorácico' },
  { id: 'srv-3', specialty_id: 'spec-1', name: 'Consulta de Cardiologia' },
  { id: 'srv-4', specialty_id: 'spec-2', name: 'Consulta de Clínica Geral' },
  { id: 'srv-5', specialty_id: 'spec-2', name: 'Check-up Básico Geral' },
  { id: 'srv-6', specialty_id: 'spec-3', name: 'Consulta de Pediatria' },
  { id: 'srv-7', specialty_id: 'spec-3', name: 'Vacinação Infantil' },
  { id: 'srv-8', specialty_id: 'spec-4', name: 'Consulta de Ginecologia' },
  { id: 'srv-9', specialty_id: 'spec-4', name: 'Ecografia Obstétrica' },
  { id: 'srv-10', specialty_id: 'spec-5', name: 'Consulta de Dermatologia' },
  { id: 'srv-11', specialty_id: 'spec-6', name: 'Exame de Refração e Vista' },
  { id: 'srv-12', specialty_id: 'spec-7', name: 'Consulta de Ortopedia' },
  { id: 'srv-13', specialty_id: 'spec-8', name: 'Limpeza Dental e Destartarização' },
  { id: 'srv-14', specialty_id: 'spec-9', name: 'Consulta de Neurologia' },
];

const INITIAL_CLINICS: ClinicWithDetails[] = [
  {
    id: 'c-1',
    owner_id: 'user-clinic-1',
    name: 'Clínica Meditex Lubango',
    slug: 'clinica-meditex-lubango',
    description: 'Referência na Huíla em cardiologia, exames de diagnóstico rápido, pediatria e urgência médica no centro do Lubango.',
    status: 'verified',
    phone: '+244 923 120 001',
    whatsapp: '+244 923 120 001',
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    location: {
      id: 'loc-1',
      clinic_id: 'c-1',
      address: 'Rua Dr. António Agostinho Neto, Bairro Comercial',
      province: 'Huíla',
      municipality: 'Lubango',
      neighborhood: 'Bairro Comercial',
      latitude: -14.9185,
      longitude: 13.4942,
    },
    images: [
      { id: 'img-1', clinic_id: 'c-1', url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800', is_cover: true },
      { id: 'img-1b', clinic_id: 'c-1', url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=800', is_cover: false },
    ],
    services: [
      { id: 'cs-1', clinic_id: 'c-1', service_id: 'srv-1', price: 18000, currency: 'AOA', service: INITIAL_SERVICES[0], specialty: INITIAL_SPECIALTIES[0] },
      { id: 'cs-2', clinic_id: 'c-1', service_id: 'srv-2', price: 45000, currency: 'AOA', service: INITIAL_SERVICES[1], specialty: INITIAL_SPECIALTIES[0] },
      { id: 'cs-3', clinic_id: 'c-1', service_id: 'srv-3', price: 25000, currency: 'AOA', service: INITIAL_SERVICES[2], specialty: INITIAL_SPECIALTIES[0] },
      { id: 'cs-4', clinic_id: 'c-1', service_id: 'srv-6', price: 20000, currency: 'AOA', service: INITIAL_SERVICES[5], specialty: INITIAL_SPECIALTIES[2] },
    ],
    doctors: [
      { id: 'doc-1', clinic_id: 'c-1', full_name: 'Dr. António Sebastião', specialty_id: 'spec-1', specialty: INITIAL_SPECIALTIES[0] },
      { id: 'doc-2', clinic_id: 'c-1', full_name: 'Dra. Esperança Neto', specialty_id: 'spec-3', specialty: INITIAL_SPECIALTIES[2] },
    ],
    reviews: [
      { id: 'rev-1', appointment_id: 'app-0', patient_id: 'p-1', clinic_id: 'c-1', rating: 5, comment: 'Excelente atendimento no setor de cardiologia no Lubango. Sem tempo de espera e com relatório na hora.', created_at: new Date(Date.now() - 5 * 86400000).toISOString(), patient_name: 'Mateus Gaspar' },
      { id: 'rev-2', appointment_id: 'app-00', patient_id: 'p-2', clinic_id: 'c-1', rating: 4, comment: 'Instalações modernas no Bairro Comercial e corpo clínico muito atencioso.', created_at: new Date(Date.now() - 12 * 86400000).toISOString(), patient_name: 'Cláudia dos Santos' },
    ],
    ratingAverage: 4.8,
    reviewsCount: 24,
    minPrice: 18000,
  },
  {
    id: 'c-2',
    owner_id: 'user-clinic-2',
    name: 'Clínica Médica da Huíla — Bairro da Lage',
    slug: 'clinica-medica-huila-lage',
    description: 'Complexo hospitalar de referência com atendimento de urgência, ginecologia, obstetrícia e ecografias de alta resolução no Lubango.',
    status: 'verified',
    phone: '+244 924 330 002',
    whatsapp: '+244 924 330 002',
    created_at: new Date(Date.now() - 50 * 86400000).toISOString(),
    location: {
      id: 'loc-2',
      clinic_id: 'c-2',
      address: 'Avenida 4 de Fevereiro, Bairro da Lage',
      province: 'Huíla',
      municipality: 'Lubango',
      neighborhood: 'Bairro da Lage',
      latitude: -14.9142,
      longitude: 13.4978,
    },
    images: [
      { id: 'img-2', clinic_id: 'c-2', url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800', is_cover: true },
      { id: 'img-2b', clinic_id: 'c-2', url: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=800', is_cover: false },
    ],
    services: [
      { id: 'cs-5', clinic_id: 'c-2', service_id: 'srv-1', price: 22000, currency: 'AOA', service: INITIAL_SERVICES[0], specialty: INITIAL_SPECIALTIES[0] },
      { id: 'cs-6', clinic_id: 'c-2', service_id: 'srv-3', price: 30000, currency: 'AOA', service: INITIAL_SERVICES[2], specialty: INITIAL_SPECIALTIES[0] },
      { id: 'cs-7', clinic_id: 'c-2', service_id: 'srv-8', price: 28000, currency: 'AOA', service: INITIAL_SERVICES[7], specialty: INITIAL_SPECIALTIES[3] },
      { id: 'cs-8', clinic_id: 'c-2', service_id: 'srv-9', price: 35000, currency: 'AOA', service: INITIAL_SERVICES[8], specialty: INITIAL_SPECIALTIES[3] },
    ],
    doctors: [
      { id: 'doc-3', clinic_id: 'c-2', full_name: 'Dr. Manuel Capango', specialty_id: 'spec-1', specialty: INITIAL_SPECIALTIES[0] },
      { id: 'doc-4', clinic_id: 'c-2', full_name: 'Dra. Teresa Muanza', specialty_id: 'spec-4', specialty: INITIAL_SPECIALTIES[3] },
    ],
    reviews: [
      { id: 'rev-3', appointment_id: 'app-01', patient_id: 'p-3', clinic_id: 'c-2', rating: 5, comment: 'Dra. Teresa é a melhor ginecologista do Lubango. Muito humana e pontual.', created_at: new Date(Date.now() - 3 * 86400000).toISOString(), patient_name: 'Ana Bela Costa' },
    ],
    ratingAverage: 4.9,
    reviewsCount: 38,
    minPrice: 22000,
  },
  {
    id: 'c-3',
    owner_id: 'user-clinic-3',
    name: 'Centro Médico Sagrada Esperança — Lubango',
    slug: 'centro-medico-sagrada-esperanca-lubango',
    description: 'Centro médico moderno no centro da cidade do Lubango, focado em consultas especializadas e medicina preventiva.',
    status: 'verified',
    phone: '+244 926 777 003',
    whatsapp: '+244 926 777 003',
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
    location: {
      id: 'loc-3',
      clinic_id: 'c-3',
      address: 'Rua 14 de Abril nº 45, Centro',
      province: 'Huíla',
      municipality: 'Lubango',
      neighborhood: 'Centro da Cidade',
      latitude: -14.9210,
      longitude: 13.4910,
    },
    images: [
      { id: 'img-3', clinic_id: 'c-3', url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800', is_cover: true },
    ],
    services: [
      { id: 'cs-9', clinic_id: 'c-3', service_id: 'srv-4', price: 15000, currency: 'AOA', service: INITIAL_SERVICES[3], specialty: INITIAL_SPECIALTIES[1] },
      { id: 'cs-10', clinic_id: 'c-3', service_id: 'srv-5', price: 35000, currency: 'AOA', service: INITIAL_SERVICES[4], specialty: INITIAL_SPECIALTIES[1] },
      { id: 'cs-11', clinic_id: 'c-3', service_id: 'srv-10', price: 25000, currency: 'AOA', service: INITIAL_SERVICES[9], specialty: INITIAL_SPECIALTIES[4] },
    ],
    doctors: [
      { id: 'doc-5', clinic_id: 'c-3', full_name: 'Dr. Carlos Morais', specialty_id: 'spec-2', specialty: INITIAL_SPECIALTIES[1] },
      { id: 'doc-6', clinic_id: 'c-3', full_name: 'Dra. Paula Quaresma', specialty_id: 'spec-5', specialty: INITIAL_SPECIALTIES[4] },
    ],
    reviews: [
      { id: 'rev-4', appointment_id: 'app-02', patient_id: 'p-4', clinic_id: 'c-3', rating: 4, comment: 'Muito prático no centro do Lubango. O agendamento via WhatsApp funcionou na perfeição.', created_at: new Date(Date.now() - 8 * 86400000).toISOString(), patient_name: 'João Baptista' },
    ],
    ratingAverage: 4.7,
    reviewsCount: 19,
    minPrice: 15000,
  },
  {
    id: 'c-4',
    owner_id: 'user-clinic-4',
    name: 'Clínica Bom Samaritano — Lucrécia',
    slug: 'clinica-bom-samaritano-lucrecia',
    description: 'Atendimento médico humanizado, ortopedia, reabilitação física e exames de rotina para famílias do Lubango.',
    status: 'verified',
    phone: '+244 931 550 004',
    whatsapp: '+244 931 550 004',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    location: {
      id: 'loc-4',
      clinic_id: 'c-4',
      address: 'Bairro Lucrécia / Mitcha, Lubango',
      province: 'Huíla',
      municipality: 'Lubango',
      neighborhood: 'Bairro Lucrécia',
      latitude: -14.9265,
      longitude: 13.4830,
    },
    images: [
      { id: 'img-4', clinic_id: 'c-4', url: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=800', is_cover: true },
    ],
    services: [
      { id: 'cs-12', clinic_id: 'c-4', service_id: 'srv-12', price: 26000, currency: 'AOA', service: INITIAL_SERVICES[11], specialty: INITIAL_SPECIALTIES[6] },
      { id: 'cs-13', clinic_id: 'c-4', service_id: 'srv-4', price: 16000, currency: 'AOA', service: INITIAL_SERVICES[3], specialty: INITIAL_SPECIALTIES[1] },
    ],
    doctors: [
      { id: 'doc-7', clinic_id: 'c-4', full_name: 'Dr. Fernando Luvualu', specialty_id: 'spec-7', specialty: INITIAL_SPECIALTIES[6] },
    ],
    reviews: [
      { id: 'rev-5', appointment_id: 'app-03', patient_id: 'p-5', clinic_id: 'c-4', rating: 5, comment: 'Excelente especialista em ortopedia. Tratamento rápido e atencioso.', created_at: new Date(Date.now() - 2 * 86400000).toISOString(), patient_name: 'Kelson Pinto' },
    ],
    ratingAverage: 4.6,
    reviewsCount: 15,
    minPrice: 16000,
  },
  {
    id: 'c-5',
    owner_id: 'user-clinic-5',
    name: 'Centro de Diagnóstico Serra da Chela',
    slug: 'centro-diagnostico-serra-da-chela',
    description: 'Diagnóstico por imagem, ecografias, pediatria e estomatologia na zona nobre de Nossa Senhora do Monte.',
    status: 'verified',
    phone: '+244 945 889 005',
    whatsapp: '+244 945 889 005',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    location: {
      id: 'loc-5',
      clinic_id: 'c-5',
      address: 'Zona de Nossa Senhora do Monte, Lubango',
      province: 'Huíla',
      municipality: 'Lubango',
      neighborhood: 'Nossa Senhora do Monte',
      latitude: -14.9312,
      longitude: 13.5024,
    },
    images: [
      { id: 'img-5', clinic_id: 'c-5', url: 'https://images.unsplash.com/photo-1504813184591-01572f98c85f?auto=format&fit=crop&q=80&w=800', is_cover: true },
    ],
    services: [
      { id: 'cs-14', clinic_id: 'c-5', service_id: 'srv-6', price: 18000, currency: 'AOA', service: INITIAL_SERVICES[5], specialty: INITIAL_SPECIALTIES[2] },
      { id: 'cs-15', clinic_id: 'c-5', service_id: 'srv-7', price: 12000, currency: 'AOA', service: INITIAL_SERVICES[6], specialty: INITIAL_SPECIALTIES[2] },
      { id: 'cs-16', clinic_id: 'c-5', service_id: 'srv-13', price: 20000, currency: 'AOA', service: INITIAL_SERVICES[12], specialty: INITIAL_SPECIALTIES[7] },
    ],
    doctors: [
      { id: 'doc-8', clinic_id: 'c-5', full_name: 'Dra. Nair de Carvalho', specialty_id: 'spec-3', specialty: INITIAL_SPECIALTIES[2] },
    ],
    reviews: [
      { id: 'rev-6', appointment_id: 'app-04', patient_id: 'p-6', clinic_id: 'c-5', rating: 5, comment: 'Perfeito para consultas de pediatria no Lubango, ambiente tranquilo e seguro.', created_at: new Date(Date.now() - 1 * 86400000).toISOString(), patient_name: 'Marta Varela' },
    ],
    ratingAverage: 4.9,
    reviewsCount: 22,
    minPrice: 12000,
  }
];

// Helper to generate dynamic future doctor slots
function generateInitialSlots(clinics: ClinicWithDetails[]): DoctorSlot[] {
  const slots: DoctorSlot[] = [];
  const hours = [8, 9, 10, 11, 14, 15, 16, 17];
  
  clinics.forEach(clinic => {
    clinic.doctors.forEach(doctor => {
      // Create slots for today and next 5 days
      for (let dayOffset = 0; dayOffset <= 5; dayOffset++) {
        hours.forEach(hour => {
          const date = new Date();
          date.setDate(date.getDate() + dayOffset);
          date.setHours(hour, 0, 0, 0);

          const ends = new Date(date);
          ends.setMinutes(ends.getMinutes() + 45);

          // make some already booked randomly for realism
          const isBooked = (dayOffset === 0 && hour < 12) || (dayOffset === 1 && hour === 9);

          slots.push({
            id: `slot-${clinic.id}-${doctor.id}-${dayOffset}-${hour}`,
            clinic_id: clinic.id,
            doctor_id: doctor.id,
            starts_at: date.toISOString(),
            ends_at: ends.toISOString(),
            status: isBooked ? 'booked' : 'open',
            doctor,
            clinic: {
              id: clinic.id,
              name: clinic.name,
              slug: clinic.slug,
              owner_id: clinic.owner_id,
              description: clinic.description,
              status: clinic.status,
              phone: clinic.phone,
              whatsapp: clinic.whatsapp,
              created_at: clinic.created_at
            }
          });
        });
      }
    });
  });

  return slots;
}

// Local Storage Manager for Reactive State & Resilience
class CliviaDataStore {
  private clinics: ClinicWithDetails[] = [];
  private slots: DoctorSlot[] = [];
  private appointments: Appointment[] = [];
  private profiles: Profile[] = [];
  private currentUser: (Profile & { email?: string }) | null = null;

  constructor() {
    this.load();
  }

  private load() {
    try {
      const savedClinics = localStorage.getItem('clivia_clinics');
      const savedSlots = localStorage.getItem('clivia_slots');
      const savedAppointments = localStorage.getItem('clivia_appointments');
      const savedUser = localStorage.getItem('clivia_current_user');

      this.clinics = savedClinics ? JSON.parse(savedClinics) : INITIAL_CLINICS;
      this.slots = savedSlots ? JSON.parse(savedSlots) : generateInitialSlots(this.clinics);
      this.appointments = savedAppointments ? JSON.parse(savedAppointments) : [];
      
      // Default patient session
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      } else {
        this.currentUser = {
          id: 'usr-patient-demo',
          role: 'patient',
          email: 'paciente@cliviasaude.ao',
          full_name: 'Valter Fernandes (Paciente)',
          phone: '+244 923 456 789',
          created_at: new Date().toISOString()
        };
      }
    } catch {
      this.clinics = INITIAL_CLINICS;
      this.slots = generateInitialSlots(this.clinics);
      this.appointments = [];
    }
  }

  private save() {
    try {
      localStorage.setItem('clivia_clinics', JSON.stringify(this.clinics));
      localStorage.setItem('clivia_slots', JSON.stringify(this.slots));
      localStorage.setItem('clivia_appointments', JSON.stringify(this.appointments));
      if (this.currentUser) {
        localStorage.setItem('clivia_current_user', JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem('clivia_current_user');
      }
    } catch {
      // LocalStorage quota fallback
    }
  }

  // Authentication Handlers
  async login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: Profile & { email?: string } }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success && data.user) {
        const userObj: Profile & { email?: string } = {
          id: data.user.id,
          role: data.user.role,
          email: data.user.email,
          full_name: data.user.full_name,
          phone: data.user.phone,
          created_at: new Date().toISOString()
        };
        this.setCurrentUser(userObj);
        return { success: true, user: userObj };
      }

      return { success: false, error: data.error || 'Credenciais inválidas.' };
    } catch {
      // Offline / fallback auth
      const roleMap: Record<string, { role: UserRole; name: string; phone: string }> = {
        'paciente@cliviasaude.ao': { role: 'patient', name: 'Valter Fernandes (Paciente)', phone: '+244 923 456 789' },
        'clinica@cliviasaude.ao': { role: 'clinic_admin', name: 'Administração Clínica Meditex Lubango', phone: '+244 923 120 001' },
        'admin@cliviasaude.ao': { role: 'admin', name: 'Direção Clívia Saúde (Huíla)', phone: '+244 900 000 000' }
      };

      const found = roleMap[email.toLowerCase().trim()];
      if (found) {
        const fallbackUser: Profile & { email?: string } = {
          id: `usr-${Date.now()}`,
          role: found.role,
          email: email.toLowerCase().trim(),
          full_name: found.name,
          phone: found.phone,
          created_at: new Date().toISOString()
        };
        this.setCurrentUser(fallbackUser);
        return { success: true, user: fallbackUser };
      }

      return { success: false, error: 'E-mail ou palavra-passe incorretos.' };
    }
  }

  async signup(payload: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    role: UserRole;
  }): Promise<{ success: boolean; error?: string; user?: Profile & { email?: string } }> {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success && data.user) {
        const userObj: Profile & { email?: string } = {
          id: data.user.id,
          role: data.user.role,
          email: data.user.email,
          full_name: data.user.full_name,
          phone: data.user.phone,
          created_at: new Date().toISOString()
        };
        this.setCurrentUser(userObj);

        // If clinic_admin, ensure they have a clinic record created
        if (payload.role === 'clinic_admin') {
          const existing = this.clinics.find(c => c.owner_id === userObj.id);
          if (!existing) {
            this.createClinic({
              name: payload.full_name.trim() || 'Nova Clínica Lubango',
              description: 'Clínica médica de excelência em Lubango, Huíla.',
              phone: payload.phone || '+244 923 000 000',
              whatsapp: payload.phone || '+244 923 000 000',
              address: 'Lubango, Província da Huíla',
              neighborhood: 'Centro da Cidade',
              ownerId: userObj.id
            });
          }
        }

        return { success: true, user: userObj };
      }

      return { success: false, error: data.error || 'Erro ao criar conta.' };
    } catch {
      // Local fallback
      const newUser: Profile & { email?: string } = {
        id: `usr-${Date.now()}`,
        role: payload.role,
        email: payload.email,
        full_name: payload.full_name,
        phone: payload.phone || null,
        created_at: new Date().toISOString()
      };
      this.setCurrentUser(newUser);

      // If clinic_admin, create their personal clinic
      if (payload.role === 'clinic_admin') {
        const existing = this.clinics.find(c => c.owner_id === newUser.id);
        if (!existing) {
          this.createClinic({
            name: payload.full_name.trim() || 'Nova Clínica Lubango',
            description: 'Clínica médica de excelência em Lubango, Huíla.',
            phone: payload.phone || '+244 923 000 000',
            whatsapp: payload.phone || '+244 923 000 000',
            address: 'Lubango, Província da Huíla',
            neighborhood: 'Centro da Cidade',
            ownerId: newUser.id
          });
        }
      }

      return { success: true, user: newUser };
    }
  }

  logout() {
    this.currentUser = null;
    this.save();
  }

  switchRole(newRole: UserRole) {
    if (newRole === 'patient') {
      this.currentUser = {
        id: 'usr-patient-demo',
        role: 'patient',
        email: 'paciente@cliviasaude.ao',
        full_name: 'Valter Fernandes (Paciente)',
        phone: '+244 923 456 789',
        created_at: new Date().toISOString()
      };
    } else if (newRole === 'clinic_admin') {
      this.currentUser = {
        id: 'user-clinic-1',
        role: 'clinic_admin',
        email: 'clinica@cliviasaude.ao',
        full_name: 'Dr. António Sebastião (Clínica Meditex Lubango)',
        phone: '+244 923 120 001',
        created_at: new Date().toISOString()
      };
    } else if (newRole === 'admin') {
      this.currentUser = {
        id: 'usr-superadmin',
        role: 'admin',
        email: 'admin@cliviasaude.ao',
        full_name: 'Super Administrador (Clívia Saúde)',
        phone: '+244 900 000 000',
        created_at: new Date().toISOString()
      };
    }
    this.save();
  }

  // Getters
  getCurrentUser(): (Profile & { email?: string }) | null {
    return this.currentUser;
  }

  setCurrentUser(user: (Profile & { email?: string }) | null) {
    this.currentUser = user;
    this.save();
  }

  getSpecialties(): Specialty[] {
    return INITIAL_SPECIALTIES;
  }

  getServices(): ServiceItem[] {
    return INITIAL_SERVICES;
  }

  getVerifiedClinics(): ClinicWithDetails[] {
    return this.clinics.filter(c => c.status === 'verified');
  }

  getAllClinics(): ClinicWithDetails[] {
    return this.clinics;
  }

  getClinicBySlug(slug: string): ClinicWithDetails | undefined {
    return this.clinics.find(c => c.slug === slug || c.id === slug);
  }

  getClinicById(id: string): ClinicWithDetails | undefined {
    return this.clinics.find(c => c.id === id);
  }

  getSlotsForClinic(clinicId: string, doctorId?: string): DoctorSlot[] {
    return this.slots.filter(s => {
      if (s.clinic_id !== clinicId) return false;
      if (doctorId && s.doctor_id !== doctorId) return false;
      return true;
    });
  }

  getOpenSlotsForClinic(clinicId: string, doctorId?: string): DoctorSlot[] {
    return this.slots.filter(s => {
      if (s.clinic_id !== clinicId) return false;
      if (doctorId && s.doctor_id !== doctorId) return false;
      return s.status === 'open';
    });
  }

  // ATOMIC BOOK_SLOT RPC (mirrors PostgreSQL book_slot function via backend API proxy)
  async bookSlot(payload: {
    slotId: string;
    patientId: string;
    serviceId: string;
    patientName: string;
    patientPhone: string;
    notes?: string;
  }): Promise<{ success: boolean; error?: string; appointment?: Appointment }> {
    try {
      // 1. Try to call the secure backend Express API proxy
      const apiRes = await fetch('/api/book-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot_id: payload.slotId,
          patient_id: payload.patientId,
          service_id: payload.serviceId,
          patient_name: payload.patientName,
          patient_phone: payload.patientPhone,
          notes: payload.notes
        })
      });

      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (apiData.success && apiData.appointment_id) {
          // Sync local state
          const slot = this.slots.find(s => s.id === payload.slotId);
          if (slot) slot.status = 'booked';
          const clinic = slot ? this.getClinicById(slot.clinic_id) : undefined;
          const service = INITIAL_SERVICES.find(s => s.id === payload.serviceId);
          const doctor = clinic?.doctors.find(d => d.id === slot?.doctor_id);

          const syncedApp: Appointment = {
            id: apiData.appointment_id,
            patient_id: payload.patientId,
            clinic_id: slot?.clinic_id || 'c-1',
            doctor_id: slot?.doctor_id || 'doc-1',
            service_id: payload.serviceId,
            slot_id: payload.slotId,
            status: 'confirmed',
            patient_name: payload.patientName,
            patient_phone: payload.patientPhone,
            notes: payload.notes || null,
            created_at: new Date().toISOString(),
            clinic,
            doctor,
            service,
            slot
          };
          this.appointments.unshift(syncedApp);
          this.save();
          return { success: true, appointment: syncedApp };
        }
      }
    } catch {
      // Continue to client-side atomic fallback
    }

    // 2. Client-side Concurrency atomic fallback
    const slotIndex = this.slots.findIndex(s => s.id === payload.slotId);
    if (slotIndex === -1) {
      return { success: false, error: 'Horário selecionado não foi encontrado.' };
    }

    const slot = this.slots[slotIndex];
    if (slot.status !== 'open') {
      return { 
        success: false, 
        error: 'Este horário acabou de ser reservado ou já não está disponível. Por favor escolha outro horário.' 
      };
    }

    // 3. Lock & update slot status
    slot.status = 'booked';
    this.slots[slotIndex] = { ...slot };

    const clinic = this.getClinicById(slot.clinic_id);
    const service = INITIAL_SERVICES.find(s => s.id === payload.serviceId);
    const doctor = clinic?.doctors.find(d => d.id === slot.doctor_id);

    // 4. Create appointment
    const newAppointment: Appointment = {
      id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      patient_id: payload.patientId,
      clinic_id: slot.clinic_id,
      doctor_id: slot.doctor_id,
      service_id: payload.serviceId,
      slot_id: payload.slotId,
      status: 'confirmed',
      patient_name: payload.patientName,
      patient_phone: payload.patientPhone,
      notes: payload.notes || null,
      created_at: new Date().toISOString(),
      clinic,
      doctor,
      service,
      slot
    };

    this.appointments.unshift(newAppointment);
    this.save();

    return {
      success: true,
      appointment: newAppointment
    };
  }

  // Patient appointments
  getAppointmentsForPatient(patientId: string): Appointment[] {
    return this.appointments.filter(a => a.patient_id === patientId || a.patient_phone);
  }

  // Clinic appointments
  getAppointmentsForClinic(clinicId: string): Appointment[] {
    return this.appointments.filter(a => a.clinic_id === clinicId);
  }

  // Status updates
  updateAppointmentStatus(appointmentId: string, status: 'confirmed' | 'cancelled' | 'completed' | 'no_show') {
    const idx = this.appointments.findIndex(a => a.id === appointmentId);
    if (idx !== -1) {
      this.appointments[idx].status = status;
      // If cancelled, free up the slot
      if (status === 'cancelled') {
        const slotIdx = this.slots.findIndex(s => s.id === this.appointments[idx].slot_id);
        if (slotIdx !== -1) {
          this.slots[slotIdx].status = 'open';
        }
      }
      this.save();
    }
  }

  // Add review
  addReview(payload: {
    appointmentId: string;
    clinicId: string;
    patientId: string;
    patientName: string;
    rating: number;
    comment: string;
  }): { success: boolean; error?: string } {
    const app = this.appointments.find(a => a.id === payload.appointmentId);
    if (!app || app.status !== 'completed') {
      return { success: false, error: 'Apenas consultas concluídas podem receber avaliação.' };
    }

    const clinic = this.clinics.find(c => c.id === payload.clinicId);
    if (clinic) {
      const newReview: Review = {
        id: `rev-${Date.now()}`,
        appointment_id: payload.appointmentId,
        clinic_id: payload.clinicId,
        patient_id: payload.patientId,
        patient_name: payload.patientName,
        rating: payload.rating,
        comment: payload.comment,
        created_at: new Date().toISOString()
      };
      clinic.reviews.unshift(newReview);
      clinic.reviewsCount = clinic.reviews.length;
      clinic.ratingAverage = Number((clinic.reviews.reduce((acc, r) => acc + r.rating, 0) / clinic.reviews.length).toFixed(1));
      this.save();
      return { success: true };
    }
    return { success: false, error: 'Clínica não encontrada' };
  }

  // Admin clinic moderation
  updateClinicStatus(clinicId: string, status: ClinicStatus) {
    const clinic = this.clinics.find(c => c.id === clinicId);
    if (clinic) {
      clinic.status = status;
      this.save();
    }
  }

  // Add new doctor slot by clinic
  addDoctorSlot(clinicId: string, doctorId: string, startsAt: string, endsAt: string) {
    const clinic = this.getClinicById(clinicId);
    const doctor = clinic?.doctors.find(d => d.id === doctorId);
    const newSlot: DoctorSlot = {
      id: `slot-custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      clinic_id: clinicId,
      doctor_id: doctorId,
      starts_at: startsAt,
      ends_at: endsAt,
      status: 'open',
      doctor,
      clinic
    };
    this.slots.push(newSlot);
    this.save();
    return newSlot;
  }

  // Delete doctor slot (if not booked)
  deleteDoctorSlot(slotId: string): { success: boolean; error?: string } {
    const idx = this.slots.findIndex(s => s.id === slotId);
    if (idx === -1) {
      return { success: false, error: 'Horário não encontrado.' };
    }
    if (this.slots[idx].status === 'booked') {
      return { success: false, error: 'Não é possível eliminar um horário que já foi marcado por um paciente.' };
    }
    this.slots.splice(idx, 1);
    this.save();
    return { success: true };
  }

  // Update Clinic Profile Details & Sync with clinic_locations table in Supabase
  async updateClinicDetails(
    clinicId: string, 
    updates: {
      name?: string;
      description?: string;
      phone?: string;
      whatsapp?: string;
      address?: string;
      neighborhood?: string;
      municipality?: string;
      province?: string;
      latitude?: number;
      longitude?: number;
    }
  ): Promise<{ success: boolean; error?: string; location?: any }> {
    const clinic = this.clinics.find(c => c.id === clinicId);
    if (!clinic) return { success: false, error: 'Clínica não encontrada.' };

    if (updates.name) clinic.name = updates.name.trim();
    if (updates.description !== undefined) clinic.description = updates.description.trim();
    if (updates.phone !== undefined) clinic.phone = updates.phone.trim();
    if (updates.whatsapp !== undefined) clinic.whatsapp = updates.whatsapp.trim();

    if (!clinic.location) {
      clinic.location = {
        id: `loc-${clinicId}`,
        clinic_id: clinicId,
        address: updates.address || 'Lubango, Huíla',
        province: updates.province || 'Huíla',
        municipality: updates.municipality || 'Lubango',
        neighborhood: updates.neighborhood || 'Centro da Cidade',
        latitude: updates.latitude || -14.9185,
        longitude: updates.longitude || 13.4942
      };
    } else {
      if (updates.address !== undefined) clinic.location.address = updates.address.trim();
      if (updates.neighborhood !== undefined) clinic.location.neighborhood = updates.neighborhood.trim();
      if (updates.municipality !== undefined) clinic.location.municipality = updates.municipality.trim();
      if (updates.province !== undefined) clinic.location.province = updates.province.trim();
      if (updates.latitude !== undefined) clinic.location.latitude = updates.latitude;
      if (updates.longitude !== undefined) clinic.location.longitude = updates.longitude;
    }

    this.save();

    // Sincronizar remotamente com o Supabase na tabela clinic_locations
    try {
      const res = await fetch(`/api/clinics/${clinicId}/details`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clinic.name,
          description: clinic.description,
          phone: clinic.phone,
          whatsapp: clinic.whatsapp,
          address: clinic.location.address,
          neighborhood: clinic.location.neighborhood,
          municipality: clinic.location.municipality,
          province: clinic.location.province,
          latitude: clinic.location.latitude,
          longitude: clinic.location.longitude
        })
      });
      const data = await res.json();
      if (data.success) {
        return { success: true, location: data.location };
      }
    } catch {
      // Retorna sucesso local caso offline
    }

    return { success: true, location: clinic.location };
  }

  // Add Clinic Image (URL or Data URL)
  addClinicImage(clinicId: string, url: string, isCover: boolean = false): { success: boolean; error?: string } {
    const clinic = this.clinics.find(c => c.id === clinicId);
    if (!clinic) return { success: false, error: 'Clínica não encontrada.' };

    if (!clinic.images) clinic.images = [];

    if (isCover || clinic.images.length === 0) {
      clinic.images.forEach(img => { img.is_cover = false; });
    }

    clinic.images.push({
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      clinic_id: clinicId,
      url,
      is_cover: isCover || clinic.images.length === 0
    });

    this.save();
    return { success: true };
  }

  // Upload Clinic Image to Supabase Storage & Update clinic_images table
  async uploadClinicImageToStorage(
    clinicId: string, 
    imageData: string, 
    filename?: string, 
    isCover: boolean = false
  ): Promise<{ success: boolean; image?: any; error?: string; publicUrl?: string }> {
    try {
      const res = await fetch('/api/storage/clinic-images/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinic_id: clinicId,
          image_data: imageData,
          filename,
          is_cover: isCover
        })
      });

      const data = await res.json();
      if (data.success && data.image) {
        const clinic = this.clinics.find(c => c.id === clinicId);
        if (clinic) {
          if (!clinic.images) clinic.images = [];
          if (isCover || clinic.images.length === 0) {
            clinic.images.forEach(img => { img.is_cover = false; });
          }
          clinic.images.push({
            id: data.image.id,
            clinic_id: clinicId,
            url: data.image.url || data.publicUrl,
            is_cover: isCover || clinic.images.length === 0
          });
          this.save();
        }
        return { success: true, image: data.image, publicUrl: data.publicUrl };
      }

      // Fallback: add locally if network fails
      this.addClinicImage(clinicId, imageData, isCover);
      return { success: true, publicUrl: imageData };
    } catch {
      this.addClinicImage(clinicId, imageData, isCover);
      return { success: true, publicUrl: imageData };
    }
  }

  // Remove Clinic Image
  removeClinicImage(clinicId: string, imageId: string): { success: boolean; error?: string } {
    const clinic = this.clinics.find(c => c.id === clinicId);
    if (!clinic) return { success: false, error: 'Clínica não encontrada.' };

    const idx = clinic.images.findIndex(img => img.id === imageId);
    if (idx === -1) return { success: false, error: 'Foto não encontrada.' };

    const wasCover = clinic.images[idx].is_cover;
    clinic.images.splice(idx, 1);

    if (wasCover && clinic.images.length > 0) {
      clinic.images[0].is_cover = true;
    }

    this.save();

    // Trigger backend Supabase sync in background
    fetch(`/api/storage/clinic-images/${clinicId}/${imageId}`, { method: 'DELETE' }).catch(() => {});

    return { success: true };
  }

  // Set Image as Cover
  setCoverClinicImage(clinicId: string, imageId: string): { success: boolean; error?: string } {
    const clinic = this.clinics.find(c => c.id === clinicId);
    if (!clinic) return { success: false, error: 'Clínica não encontrada.' };

    let found = false;
    clinic.images.forEach(img => {
      if (img.id === imageId) {
        img.is_cover = true;
        found = true;
      } else {
        img.is_cover = false;
      }
    });

    if (!found) return { success: false, error: 'Foto não encontrada.' };

    this.save();

    // Trigger backend Supabase sync in background
    fetch('/api/storage/clinic-images/set-cover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clinic_id: clinicId, image_id: imageId })
    }).catch(() => {});

    return { success: true };
  }

  // Add Service to Clinic
  addClinicService(
    clinicId: string, 
    serviceData: { name: string; price: number; specialtyId: string }
  ): { success: boolean; error?: string } {
    const clinic = this.clinics.find(c => c.id === clinicId);
    if (!clinic) return { success: false, error: 'Clínica não encontrada.' };

    const specialty = INITIAL_SPECIALTIES.find(s => s.id === serviceData.specialtyId) || {
      id: serviceData.specialtyId,
      name: 'Clínica Geral'
    };

    // Check if service item already exists or create new one
    let srvItem = INITIAL_SERVICES.find(s => s.name.toLowerCase() === serviceData.name.trim().toLowerCase());
    if (!srvItem) {
      srvItem = {
        id: `srv-custom-${Date.now()}`,
        name: serviceData.name.trim(),
        specialty_id: specialty.id
      };
      INITIAL_SERVICES.push(srvItem);
    }

    const newClinicService = {
      id: `cs-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      clinic_id: clinicId,
      service_id: srvItem.id,
      price: serviceData.price,
      currency: 'AOA',
      service: srvItem,
      specialty
    };

    clinic.services.push(newClinicService);

    // Update minPrice
    clinic.minPrice = Math.min(...clinic.services.map(s => s.price));

    this.save();
    return { success: true };
  }

  // Update Clinic Service Price
  updateClinicServicePrice(clinicId: string, clinicServiceId: string, newPrice: number): { success: boolean; error?: string } {
    const clinic = this.clinics.find(c => c.id === clinicId);
    if (!clinic) return { success: false, error: 'Clínica não encontrada.' };

    const cs = clinic.services.find(s => s.id === clinicServiceId);
    if (!cs) return { success: false, error: 'Serviço não encontrado.' };

    cs.price = newPrice;
    clinic.minPrice = Math.min(...clinic.services.map(s => s.price));

    this.save();
    return { success: true };
  }

  // Remove Service from Clinic
  removeClinicService(clinicId: string, clinicServiceId: string): { success: boolean; error?: string } {
    const clinic = this.clinics.find(c => c.id === clinicId);
    if (!clinic) return { success: false, error: 'Clínica não encontrada.' };

    const idx = clinic.services.findIndex(s => s.id === clinicServiceId);
    if (idx === -1) return { success: false, error: 'Serviço não encontrado.' };

    clinic.services.splice(idx, 1);
    if (clinic.services.length > 0) {
      clinic.minPrice = Math.min(...clinic.services.map(s => s.price));
    } else {
      clinic.minPrice = 0;
    }

    this.save();
    return { success: true };
  }

  // Add Doctor to Clinic
  addDoctor(
    clinicId: string, 
    doctorData: { full_name: string; specialty_id: string }
  ): { success: boolean; error?: string } {
    const clinic = this.clinics.find(c => c.id === clinicId);
    if (!clinic) return { success: false, error: 'Clínica não encontrada.' };

    const specialty = INITIAL_SPECIALTIES.find(s => s.id === doctorData.specialty_id);

    const newDoc: Doctor = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      clinic_id: clinicId,
      full_name: doctorData.full_name.trim(),
      specialty_id: doctorData.specialty_id,
      specialty
    };

    clinic.doctors.push(newDoc);
    this.save();
    return { success: true };
  }

  // Remove Doctor from Clinic
  removeDoctor(clinicId: string, doctorId: string): { success: boolean; error?: string } {
    const clinic = this.clinics.find(c => c.id === clinicId);
    if (!clinic) return { success: false, error: 'Clínica não encontrada.' };

    const idx = clinic.doctors.findIndex(d => d.id === doctorId);
    if (idx === -1) return { success: false, error: 'Médico não encontrado.' };

    clinic.doctors.splice(idx, 1);
    this.save();
    return { success: true };
  }

  // Create Brand New Clinic
  createClinic(payload: {
    name: string;
    description: string;
    phone: string;
    whatsapp: string;
    address: string;
    neighborhood: string;
    coverImageUrl?: string;
    ownerId?: string;
  }): { success: boolean; clinic?: ClinicWithDetails; error?: string } {
    if (!payload.name.trim()) return { success: false, error: 'O nome da clínica é obrigatório.' };

    const newId = `c-new-${Date.now()}`;
    const slug = payload.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const defaultImage = payload.coverImageUrl || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800';

    const newClinic: ClinicWithDetails = {
      id: newId,
      owner_id: payload.ownerId || this.currentUser?.id || `user-clinic-${Date.now()}`,
      name: payload.name.trim(),
      slug: `${slug}-${Math.random().toString(36).substr(2, 4)}`,
      description: payload.description.trim() || 'Clínica médica de excelência em Lubango, Huíla.',
      status: 'verified',
      phone: payload.phone.trim() || '+244 923 000 000',
      whatsapp: payload.whatsapp.trim() || payload.phone.trim() || '+244 923 000 000',
      created_at: new Date().toISOString(),
      location: {
        id: `loc-${newId}`,
        clinic_id: newId,
        address: payload.address.trim() || 'Lubango, Província da Huíla',
        province: 'Huíla',
        municipality: 'Lubango',
        neighborhood: payload.neighborhood.trim() || 'Centro da Cidade',
        latitude: -14.9185 + (Math.random() - 0.5) * 0.02,
        longitude: 13.4942 + (Math.random() - 0.5) * 0.02
      },
      images: [
        { id: `img-${newId}-1`, clinic_id: newId, url: defaultImage, is_cover: true }
      ],
      services: [
        { 
          id: `cs-${newId}-1`, 
          clinic_id: newId, 
          service_id: INITIAL_SERVICES[0].id, 
          price: 18000, 
          currency: 'AOA', 
          service: INITIAL_SERVICES[0], 
          specialty: INITIAL_SPECIALTIES[0] 
        },
        { 
          id: `cs-${newId}-2`, 
          clinic_id: newId, 
          service_id: INITIAL_SERVICES[3].id, 
          price: 15000, 
          currency: 'AOA', 
          service: INITIAL_SERVICES[3], 
          specialty: INITIAL_SPECIALTIES[1] 
        },
        { 
          id: `cs-${newId}-3`, 
          clinic_id: newId, 
          service_id: INITIAL_SERVICES[5].id, 
          price: 20000, 
          currency: 'AOA', 
          service: INITIAL_SERVICES[5], 
          specialty: INITIAL_SPECIALTIES[2] 
        }
      ],
      doctors: [
        { 
          id: `doc-${newId}-1`, 
          clinic_id: newId, 
          full_name: payload.name.includes('Dr.') ? payload.name : `Dr. Director Clínico (${payload.name.split(' ')[0]})`, 
          specialty_id: INITIAL_SPECIALTIES[0].id, 
          specialty: INITIAL_SPECIALTIES[0] 
        },
        { 
          id: `doc-${newId}-2`, 
          clinic_id: newId, 
          full_name: 'Dra. Médica Assistente', 
          specialty_id: INITIAL_SPECIALTIES[1].id, 
          specialty: INITIAL_SPECIALTIES[1] 
        }
      ],
      reviews: [],
      ratingAverage: 5.0,
      reviewsCount: 1,
      minPrice: 15000
    };

    // Add initial open slots for next days so patients can book right away
    const now = new Date();
    const doc1Id = newClinic.doctors[0].id;
    const doc2Id = newClinic.doctors[1].id;
    
    [1, 2, 3].forEach(dayOffset => {
      [9, 11, 14, 16].forEach((hour, idx) => {
        const slotDate = new Date(now);
        slotDate.setDate(slotDate.getDate() + dayOffset);
        slotDate.setHours(hour, 0, 0, 0);
        const endsDate = new Date(slotDate.getTime() + 45 * 60000);

        this.slots.push({
          id: `slot-${newId}-${dayOffset}-${hour}`,
          clinic_id: newId,
          doctor_id: idx % 2 === 0 ? doc1Id : doc2Id,
          starts_at: slotDate.toISOString(),
          ends_at: endsDate.toISOString(),
          status: 'open',
          doctor: idx % 2 === 0 ? newClinic.doctors[0] : newClinic.doctors[1],
          clinic: {
            id: newClinic.id,
            name: newClinic.name,
            slug: newClinic.slug,
            owner_id: newClinic.owner_id,
            description: newClinic.description,
            status: newClinic.status,
            phone: newClinic.phone,
            whatsapp: newClinic.whatsapp,
            created_at: newClinic.created_at
          }
        });
      });
    });

    this.clinics.unshift(newClinic);
    this.save();
    return { success: true, clinic: newClinic };
  }
}

export const dataStore = new CliviaDataStore();
