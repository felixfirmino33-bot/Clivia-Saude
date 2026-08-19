import React, { useState, useEffect } from 'react';
import { 
  AppView, 
  SearchFilterState, 
  ClinicWithDetails, 
  ServiceItem, 
  Specialty, 
  DoctorSlot,
  Appointment
} from './types';
import { dataStore } from './lib/supabase/client';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { SearchBar } from './components/search/SearchBar';
import { ClinicCard } from './components/search/ClinicCard';
import { ClinicMap } from './components/maps/ClinicMap';
import { ClinicDetailView } from './components/clinic/ClinicDetailView';
import { BookingModal } from './components/booking/BookingModal';
import { ClinicPortal } from './components/dashboard/ClinicPortal';
import { AdminPortal } from './components/admin/AdminPortal';
import { PatientPortal } from './components/patient/PatientPortal';
import { AuthModal } from './components/auth/AuthModal';
import { 
  ShieldCheck, MapPin, Stethoscope, Clock, 
  MessageSquare, Star, ArrowRight, CheckCircle2, Sparkles, Filter 
} from 'lucide-react';
import { formatPriceAOA } from './lib/notifications/whatsapp';
import { UserRole } from './types/database';
import heroBgImage from './assets/images/hero_medical_bg_1787104027650.jpg';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>({ type: 'home' });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authModalRole, setAuthModalRole] = useState<UserRole>('patient');

  // Core Data
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [clinics, setClinics] = useState<ClinicWithDetails[]>([]);

  // Search and Filter State
  const [filters, setFilters] = useState<SearchFilterState>({
    searchQuery: '',
    selectedServiceId: null,
    selectedSpecialtyId: null,
    municipality: null,
    neighborhood: null,
    maxPrice: null,
    sortBy: 'recommended'
  });

  // Booking Modal State
  const [bookingTarget, setBookingTarget] = useState<{
    clinic: ClinicWithDetails;
    serviceId?: string;
    doctorId?: string;
  } | null>(null);

  // Active Map View Toggle
  const [showMapView, setShowMapView] = useState(true);

  // Load data on start & upon updates
  useEffect(() => {
    setSpecialties(dataStore.getSpecialties());
    setServices(dataStore.getServices());
    setClinics(dataStore.getVerifiedClinics());
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login', role: UserRole = 'patient') => {
    setAuthModalMode(mode);
    setAuthModalRole(role);
    setAuthModalOpen(true);
  };

  const handleFilterChange = (newFilters: Partial<SearchFilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSearchSubmit = () => {
    // Scroll smoothly to results
    const el = document.getElementById('search-results-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filtered Clinics Logic
  const filteredClinics = clinics.filter(clinic => {
    // 1. Service / Query Match
    if (filters.selectedServiceId) {
      const hasService = clinic.services.some(s => s.service_id === filters.selectedServiceId);
      if (!hasService) return false;
    } else if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const nameMatch = clinic.name.toLowerCase().includes(q);
      const descMatch = clinic.description?.toLowerCase().includes(q) || false;
      const serviceMatch = clinic.services.some(s => s.service?.name.toLowerCase().includes(q));
      const doctorMatch = clinic.doctors.some(d => d.full_name.toLowerCase().includes(q));
      if (!nameMatch && !descMatch && !serviceMatch && !doctorMatch) return false;
    }

    // 2. Specialty Match
    if (filters.selectedSpecialtyId) {
      const hasSpecialty = clinic.services.some(s => s.specialty?.id === filters.selectedSpecialtyId) ||
                           clinic.doctors.some(d => d.specialty_id === filters.selectedSpecialtyId);
      if (!hasSpecialty) return false;
    }

    // 3. Municipality Match
    if (filters.municipality && filters.municipality !== 'Todos os Municípios') {
      const mun = filters.municipality.toLowerCase();
      const clinicMun = (clinic.location?.municipality || '').toLowerCase();
      const clinicNeigh = (clinic.location?.neighborhood || '').toLowerCase();
      const clinicAddr = (clinic.location?.address || '').toLowerCase();
      if (!clinicMun.includes(mun) && !clinicNeigh.includes(mun) && !clinicAddr.includes(mun)) {
        return false;
      }
    }

    // 4. Max Price Filter
    if (filters.maxPrice && clinic.minPrice && clinic.minPrice > filters.maxPrice) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'price_asc') {
      return (a.minPrice || 0) - (b.minPrice || 0);
    }
    if (filters.sortBy === 'rating') {
      return b.ratingAverage - a.ratingAverage;
    }
    return 0; // recommended
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        onRefresh={handleRefresh}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Content Area */}
      <main className="flex-1">

        {/* 1. HOME / SEARCH VIEW */}
        {(currentView.type === 'home' || currentView.type === 'search') && (
          <div>
            
            {/* Hero Section with Background Image */}
            <section className="relative text-white pt-14 pb-24 px-4 sm:px-6 overflow-hidden">
              {/* Background Image & Layered Gradient Overlays */}
              <div className="absolute inset-0 z-0">
                <img
                  src={heroBgImage}
                  alt="Clívia Saúde — Atendimento Médico em Angola"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-teal-950/80 to-slate-900/95" />
                <div className="absolute inset-0 bg-teal-900/30 mix-blend-multiply" />
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:20px_20px]" />
              </div>
              
              <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-['Outfit',sans-serif] tracking-tight leading-tight drop-shadow-md">
                  Encontre a saúde que precisa.
                </h1>

                <p className="text-sm sm:text-base text-teal-100/95 max-w-2xl mx-auto leading-relaxed drop-shadow-sm font-medium">
                  Compare preços em Kwanzas (AOA), consulte vagas em tempo real nas melhores clínicas da Huíla (Lubango) e receba confirmações imediatas por WhatsApp.
                </p>

                {/* Primary Search Component */}
                <div className="pt-6">
                  <SearchBar
                    services={services}
                    specialties={specialties}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onSearchSubmit={handleSearchSubmit}
                  />
                </div>
              </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
              <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 sm:p-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
                  <div className="space-y-5">
                    <span className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-teal-700">
                      Plataforma de saúde em Angola
                    </span>
                    <div className="space-y-3">
                      <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight font-['Outfit',sans-serif]">
                        A forma mais simples de encontrar a clínica certa.
                      </h2>
                      <p className="max-w-xl text-sm sm:text-base text-slate-600 leading-relaxed">
                        Compare preços, veja disponibilidade em tempo real e marque consultas com confiança.
                        Tudo em um só lugar, pensado para facilitar a vida de pacientes e clínicas da Huíla.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleFilterChange({ selectedSpecialtyId: null, selectedServiceId: null })}
                        className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
                      >
                        Explorar clínicas
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenAuth('login', 'patient')}
                        className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        Entrar na plataforma
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="partner-card partner-card--ag">
                      <div className="partner-card__mark partner-card__mark--ag" aria-hidden="true">
                        <svg viewBox="0 0 140 140" role="img" aria-label="AE Gadget logo">
                          <path d="M18 84c20-38 52-56 90-52-14 0-32 4-48 18-14 12-24 28-31 42-4 8-8 12-11 14Z" fill="none" stroke="#fff7ed" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M34 86c16-28 36-42 70-44" fill="none" stroke="#fff7ed" strokeWidth="8" strokeLinecap="round" opacity="0.92"/>
                          <circle cx="92" cy="40" r="9" fill="#fff7ed"/>
                          <path d="M108 48c-12 22-23 34-40 42" fill="none" stroke="#fff7ed" strokeWidth="7" strokeLinecap="round" opacity="0.9"/>
                        </svg>
                      </div>
                      <span className="partner-logo-text">AE GADGET</span>
                      <small>Soluções Tecnológicas</small>
                    </div>
                    <div className="partner-card partner-card--integra">
                      <div className="partner-card__mark partner-card__mark--integra" aria-hidden="true">
                        <svg viewBox="0 0 140 140" role="img" aria-label="Integra logo">
                          <rect x="14" y="14" width="42" height="42" rx="10" fill="rgba(255,255,255,0.12)" stroke="#fff" strokeWidth="7"/>
                          <rect x="82" y="14" width="42" height="42" rx="10" fill="rgba(255,255,255,0.12)" stroke="#fff" strokeWidth="7"/>
                          <rect x="14" y="82" width="42" height="42" rx="10" fill="rgba(255,255,255,0.12)" stroke="#fff" strokeWidth="7"/>
                          <rect x="82" y="82" width="42" height="42" rx="10" fill="rgba(255,255,255,0.12)" stroke="#fff" strokeWidth="7"/>
                          <path d="M70 20v100M20 70h100" stroke="#fff" strokeWidth="7" strokeLinecap="round"/>
                          <circle cx="70" cy="70" r="13" fill="#fff"/>
                        </svg>
                      </div>
                      <span className="partner-logo-text">INTEGRA</span>
                      <small>Sistema</small>
                    </div>
                    <div className="partner-card partner-card--nar">
                      <div className="partner-card__mark partner-card__mark--nar" aria-hidden="true">
                        <svg viewBox="0 0 160 140" role="img" aria-label="Narosário logo">
                          <path d="M22 82h70l16-22h32v22H22v-22Z" fill="#fff" opacity="0.12"/>
                          <path d="M28 82h60l18-24h36v20H28v4Z" fill="#f8fafc" opacity="0.14"/>
                          <path d="M50 52c16 0 30 10 34 26H65l-18 24H28l11-22c6-12 15-20 20-28Z" fill="#fbbf24" opacity="0.95"/>
                          <path d="M76 42h20v14H76zm26 0h14v18H102zM22 90h90v10H22zm94 0h16v10h-16z" fill="#fff" opacity="0.92"/>
                          <circle cx="104" cy="46" r="24" fill="none" stroke="#fff7ed" strokeWidth="8"/>
                          <path d="M104 26v12M104 58v12M88 46h12M120 46h12M93 31l8 8M115 53l-8 8M115 31l-8 8M93 53l8-8" stroke="#fff7ed" strokeWidth="5" strokeLinecap="round"/>
                          <circle cx="104" cy="46" r="5" fill="#fff7ed"/>
                        </svg>
                      </div>
                      <span className="partner-logo-text">NAROSÁRIO</span>
                      <small>ENTREGAS</small>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Specialties Quick Carousel */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-200/80 flex items-center gap-2 overflow-x-auto">
                <button
                  onClick={() => handleFilterChange({ selectedSpecialtyId: null, selectedServiceId: null })}
                  className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    !filters.selectedSpecialtyId
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Todas as Especialidades
                </button>
                {specialties.map(spec => (
                  <button
                    key={spec.id}
                    onClick={() => {
                      handleFilterChange({
                        selectedSpecialtyId: filters.selectedSpecialtyId === spec.id ? null : spec.id,
                        selectedServiceId: null
                      });
                    }}
                    className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      filters.selectedSpecialtyId === spec.id
                        ? 'bg-teal-700 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {spec.name}
                  </button>
                ))}
              </div>
            </section>

            {/* Results Section with Map & Cards */}
            <section id="search-results-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6">
              
              {/* Results Header & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-['Outfit',sans-serif]">
                    Clínicas Disponíveis na Huíla — Lubango ({filteredClinics.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {filters.selectedServiceId
                      ? `Exibindo clínicas que realizam: ${services.find(s => s.id === filters.selectedServiceId)?.name}`
                      : 'Clínicas credenciadas e verificadas com marcação online'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 text-xs font-bold">
                    <button
                      onClick={() => handleFilterChange({ sortBy: 'recommended' })}
                      className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        filters.sortBy === 'recommended' ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Recomendadas
                    </button>
                    <button
                      onClick={() => handleFilterChange({ sortBy: 'price_asc' })}
                      className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        filters.sortBy === 'price_asc' ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Menor Preço
                    </button>
                    <button
                      onClick={() => handleFilterChange({ sortBy: 'rating' })}
                      className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        filters.sortBy === 'rating' ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Melhor Avaliação
                    </button>
                  </div>

                  <button
                    onClick={() => setShowMapView(prev => !prev)}
                    className={`hidden lg:flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-colors cursor-pointer ${
                      showMapView
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{showMapView ? 'Ocultar Mapa' : 'Ver no Mapa'}</span>
                  </button>
                </div>
              </div>

              {/* Grid with Interactive Map and Clinic Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column: Clinic Listings */}
                <div className={`${showMapView ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
                  {filteredClinics.length > 0 ? (
                    filteredClinics.map(clinic => (
                      <ClinicCard
                        key={clinic.id}
                        clinic={clinic}
                        availableSlots={dataStore.getOpenSlotsForClinic(clinic.id)}
                        selectedServiceId={filters.selectedServiceId}
                        onViewClinic={(slug) => setCurrentView({ type: 'clinic', slug })}
                        onBookDirect={(clinicId, srvId) => {
                          const target = clinics.find(c => c.id === clinicId);
                          if (target) {
                            setBookingTarget({ clinic: target, serviceId: srvId });
                          }
                        }}
                      />
                    ))
                  ) : (
                    <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
                      <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h3 className="text-base font-bold text-slate-800">Nenhuma clínica encontrada</h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Tente limpar os filtros de pesquisa ou pesquisar por outro exame ou município/bairro na Huíla.
                      </p>
                      <button
                        onClick={() => setFilters({
                          searchQuery: '',
                          selectedServiceId: null,
                          selectedSpecialtyId: null,
                          municipality: null,
                          neighborhood: null,
                          maxPrice: null,
                          sortBy: 'recommended'
                        })}
                        className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl"
                      >
                        Limpar Todos os Filtros
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Column: Sticky Interactive Leaflet Map */}
                {showMapView && (
                  <div className="lg:col-span-5 sticky top-24">
                    <div className="bg-white p-2 rounded-3xl border border-slate-200/80 shadow-md">
                      <ClinicMap
                        clinics={filteredClinics}
                        onSelectClinic={(c) => setCurrentView({ type: 'clinic', slug: c.slug })}
                        className="h-[520px] w-full rounded-2xl overflow-hidden"
                      />
                    </div>
                  </div>
                )}

              </div>

            </section>

            {/* Why Clívia Saúde Section */}
            <section className="bg-white border-y border-slate-200/80 py-16 px-4 sm:px-6 my-10">
              <div className="max-w-6xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                    Vantagens Clívia Saúde
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-['Outfit',sans-serif] text-slate-900 mt-3">
                    A forma mais segura de marcar consultas no Lubango e Huíla
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/70 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Confirmação por WhatsApp</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Recebe a confirmação da consulta e lembretes diretos no WhatsApp, para não esquecer a sua marcação.
                    </p>
                  </div>

                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/70 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Reserva segura</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      O horário fica protegido para que duas pessoas não possam marcar o mesmo atendimento ao mesmo tempo.
                    </p>
                  </div>

                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/70 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                      <Star className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Avaliações reais</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Só aparecem avaliações de quem já usou o serviço, para que as opiniões reflitam a experiência real.
                    </p>
                  </div>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* 2. CLINIC DETAIL VIEW */}
        {currentView.type === 'clinic' && (() => {
          const clinic = dataStore.getClinicBySlug(currentView.slug);
          if (!clinic) {
            return (
              <div className="max-w-4xl mx-auto py-20 text-center">
                <p className="text-slate-600 font-bold">Clínica não encontrada.</p>
                <button
                  onClick={() => setCurrentView({ type: 'home' })}
                  className="mt-4 px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl"
                >
                  Voltar à Pesquisa
                </button>
              </div>
            );
          }
          return (
            <ClinicDetailView
              clinic={clinic}
              availableSlots={dataStore.getOpenSlotsForClinic(clinic.id)}
              onBack={() => setCurrentView({ type: 'home' })}
              onBookService={(srvId, docId) => {
                setBookingTarget({ clinic, serviceId: srvId, doctorId: docId });
              }}
            />
          );
        })()}

        {/* 3. PATIENT PORTAL VIEW */}
        {currentView.type === 'patient-portal' && (
          <PatientPortal
            onRefresh={handleRefresh}
            onExploreClinics={() => setCurrentView({ type: 'home' })}
          />
        )}

        {/* 4. CLINIC PORTAL VIEW */}
        {currentView.type === 'clinic-portal' && (() => {
          const user = dataStore.getCurrentUser();
          const userClinic = clinics.find(c => c.owner_id === user?.id) || clinics[0];
          return (
            <ClinicPortal
              clinic={userClinic}
              allClinics={clinics}
              onRefresh={handleRefresh}
              onViewPublicProfile={(slug) => setCurrentView({ type: 'clinic', slug })}
            />
          );
        })()}

        {/* 5. ADMIN PORTAL VIEW */}
        {currentView.type === 'admin-portal' && (
          <AdminPortal onRefresh={handleRefresh} />
        )}

      </main>

      {/* Global Concurrency-Safe Booking Modal */}
      {bookingTarget && (
        <BookingModal
          clinic={bookingTarget.clinic}
          initialServiceId={bookingTarget.serviceId}
          initialDoctorId={bookingTarget.doctorId}
          onClose={() => setBookingTarget(null)}
          onBookingSuccess={(app) => {
            handleRefresh();
          }}
        />
      )}

      {/* Global Authentication Modal (Email/Password + Roles) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        initialRole={authModalRole}
        onAuthSuccess={() => {
          handleRefresh();
          const user = dataStore.getCurrentUser();
          if (user?.role === 'clinic_admin') {
            setCurrentView({ type: 'clinic-portal' });
          } else if (user?.role === 'admin') {
            setCurrentView({ type: 'admin-portal' });
          }
        }}
      />

      {/* Global Footer */}
      <Footer />

    </div>
  );
}

const INITIAL_CLINICS: ClinicWithDetails[] = [];
