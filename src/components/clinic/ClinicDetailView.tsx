import React, { useState } from 'react';
import { ClinicWithDetails, DoctorSlot } from '../../types';
import { formatPriceAOA, generateWhatsAppDirectLink } from '../../lib/notifications/whatsapp';
import { 
  MapPin, Star, ShieldCheck, Phone, MessageSquare, Clock, 
  Calendar, Check, Stethoscope, User, ArrowLeft, Share2, Info 
} from 'lucide-react';
import { ClinicMap } from '../maps/ClinicMap';

interface ClinicDetailViewProps {
  clinic: ClinicWithDetails;
  availableSlots: DoctorSlot[];
  onBack: () => void;
  onBookService: (serviceId?: string, doctorId?: string) => void;
}

export const ClinicDetailView: React.FC<ClinicDetailViewProps> = ({
  clinic,
  availableSlots,
  onBack,
  onBookService,
}) => {
  const [activeTab, setActiveTab] = useState<'services' | 'doctors' | 'location' | 'reviews'>('services');

  const coverImage = clinic.images.find(img => img.is_cover)?.url || clinic.images[0]?.url;
  const directClinicWaMsg = `Olá, gostaria de obter informações sobre os serviços da ${clinic.name} através da plataforma Clívia Saúde.`;
  const clinicWaLink = clinic.whatsapp ? generateWhatsAppDirectLink(clinic.whatsapp, directClinicWaMsg) : '#';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6" id="clivia-clinic-detail">
      
      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-bold text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar à pesquisa</span>
        </button>

        <div className="flex items-center gap-2">
          {clinic.whatsapp && (
            <a
              href={clinicWaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#1EBE5D] font-bold text-xs px-3 py-2 rounded-xl transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp da Clínica</span>
            </a>
          )}
        </div>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Cover / Gallery Header */}
        <div className="relative h-64 sm:h-80 w-full bg-slate-900">
          <img
            src={coverImage}
            alt={clinic.name}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
          
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              <ShieldCheck className="w-4 h-4" />
              Clínica Verificada em Lubango
            </span>
          </div>

          <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex items-center bg-amber-400 text-slate-900 px-2 py-0.5 rounded-md font-extrabold text-xs">
                  <Star className="w-3.5 h-3.5 fill-slate-900 mr-1" />
                  {clinic.ratingAverage}
                </div>
                <span className="text-white/80 text-xs font-medium">({clinic.reviewsCount} avaliações de pacientes)</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] tracking-tight">
                {clinic.name}
              </h1>
              <p className="text-sm text-slate-200 flex items-center gap-1.5 mt-1.5">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                {clinic.location?.address || `${clinic.location?.municipality || 'Lubango'}, Huíla`}
              </p>
            </div>

            <button
              onClick={() => onBookService()}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold px-6 py-3.5 rounded-2xl shadow-xl hover:shadow-teal-500/25 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Calendar className="w-4 h-4" />
              <span>Marcar Consulta Online</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/50">
          <div className="p-4 text-center">
            <span className="text-xs text-slate-400 font-semibold uppercase block">Serviços Oferecidos</span>
            <strong className="text-base font-extrabold text-slate-800">{clinic.services.length} exames & consultas</strong>
          </div>
          <div className="p-4 text-center">
            <span className="text-xs text-slate-400 font-semibold uppercase block">Médicos no Corpo Clínico</span>
            <strong className="text-base font-extrabold text-slate-800">{clinic.doctors.length} especialistas</strong>
          </div>
          <div className="p-4 text-center">
            <span className="text-xs text-slate-400 font-semibold uppercase block">Preço Mínimo</span>
            <strong className="text-base font-extrabold text-teal-700 font-['Outfit',sans-serif]">{formatPriceAOA(clinic.minPrice)}</strong>
          </div>
          <div className="p-4 text-center">
            <span className="text-xs text-slate-400 font-semibold uppercase block">Município</span>
            <strong className="text-base font-extrabold text-slate-800">{clinic.location?.municipality || 'Lubango'}</strong>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 gap-6 overflow-x-auto text-sm font-bold">
          <button
            onClick={() => setActiveTab('services')}
            className={`py-4 border-b-2 transition-colors shrink-0 cursor-pointer ${
              activeTab === 'services'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Serviços & Preços ({clinic.services.length})
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            className={`py-4 border-b-2 transition-colors shrink-0 cursor-pointer ${
              activeTab === 'doctors'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Médicos ({clinic.doctors.length})
          </button>
          <button
            onClick={() => setActiveTab('location')}
            className={`py-4 border-b-2 transition-colors shrink-0 cursor-pointer ${
              activeTab === 'location'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Localização & Contactos
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-4 border-b-2 transition-colors shrink-0 cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Avaliações ({clinic.reviews.length})
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="p-6 sm:p-8">
          
          {/* TAB 1: Services & Transparent Pricing in AOA */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Catálogo de Serviços e Exames</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Preços transparentes em Kwanzas (AOA) com garantia de reserva</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {clinic.services.map((cs) => (
                  <div
                    key={cs.id}
                    className="p-4 rounded-2xl border border-slate-200/90 hover:border-teal-300 bg-slate-50/40 hover:bg-teal-50/20 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-100/80 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{cs.service?.name}</h4>
                        <span className="text-xs text-slate-500 font-medium">{cs.specialty?.name || 'Clínica Especializada'}</span>
                        <div className="mt-1 text-xs font-extrabold text-teal-800 font-['Outfit',sans-serif]">
                          {formatPriceAOA(cs.price)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onBookService(cs.service_id)}
                      className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
                    >
                      Agendar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Doctors / Clinical Staff */}
          {activeTab === 'doctors' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Corpo Clínico Credenciado</h3>
                <p className="text-xs text-slate-500 mt-0.5">Médicos e especialistas registados na Ordem dos Médicos de Angola</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {clinic.doctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center flex flex-col items-center justify-between"
                  >
                    <div className="w-16 h-16 rounded-full bg-teal-50 border-2 border-teal-200 text-teal-700 flex items-center justify-center mb-3">
                      <User className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">{doc.full_name}</h4>
                    <span className="text-xs bg-teal-50 text-teal-800 font-bold px-2.5 py-1 rounded-full mt-1">
                      {doc.specialty?.name || 'Especialista'}
                    </span>

                    <button
                      onClick={() => onBookService(undefined, doc.id)}
                      className="mt-4 w-full py-2 px-3 bg-slate-900 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Consultar Agenda
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Location & Leaflet Map */}
          {activeTab === 'location' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Localização em Lubango</h3>
                <p className="text-xs text-slate-500 mt-0.5">{clinic.location?.address}</p>
              </div>

              <ClinicMap
                clinics={[clinic]}
                selectedClinicId={clinic.id}
                onSelectClinic={() => {}}
                className="h-[360px] w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200"
              />

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block">Endereço Completo:</span>
                  <strong className="text-slate-800 block text-sm mt-0.5">{clinic.location?.address}</strong>
                  <span className="text-slate-500">{clinic.location?.neighborhood || 'Centro'}, {clinic.location?.municipality || 'Lubango'}, Província da Huíla</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Contactos de Apoio:</span>
                  <strong className="text-slate-800 block text-sm mt-0.5">{clinic.phone || '+244 923 120 001'}</strong>
                  {clinic.whatsapp && (
                    <span className="text-emerald-700 font-semibold block mt-0.5">WhatsApp disponível: {clinic.whatsapp}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Real Patient Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Avaliações de Pacientes</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Apenas pacientes que concluíram consultas marcadas pela Clívia Saúde podem avaliar (Anti-Fraude RLS).
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="font-extrabold text-amber-900 text-base">{clinic.ratingAverage}</span>
                  <span className="text-xs text-amber-700 font-medium">/ 5.0</span>
                </div>
              </div>

              <div className="space-y-3">
                {clinic.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800">{rev.patient_name || 'Paciente Verificado'}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          Consulta Concluída ✓
                        </span>
                      </div>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400 block mt-2">
                      {new Date(rev.created_at).toLocaleDateString('pt-AO')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
