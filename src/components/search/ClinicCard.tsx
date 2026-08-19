import React from 'react';
import { ClinicWithDetails, DoctorSlot } from '../../types';
import { formatPriceAOA } from '../../lib/notifications/whatsapp';
import { MapPin, Star, ShieldCheck, Clock, Calendar, ChevronRight, Phone, MessageSquare } from 'lucide-react';

interface ClinicCardProps {
  clinic: ClinicWithDetails;
  availableSlots?: DoctorSlot[];
  selectedServiceId?: string | null;
  onViewClinic: (slug: string) => void;
  onBookDirect: (clinicId: string, serviceId?: string) => void;
}

export const ClinicCard: React.FC<ClinicCardProps> = ({
  clinic,
  availableSlots = [],
  selectedServiceId,
  onViewClinic,
  onBookDirect
}) => {
  const coverImage = clinic.images.find(img => img.is_cover)?.url || clinic.images[0]?.url || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600';
  
  // Filter matched service if any
  const matchedService = selectedServiceId 
    ? clinic.services.find(s => s.service_id === selectedServiceId)
    : clinic.services[0];

  const nextSlots = availableSlots.filter(s => s.status === 'open').slice(0, 3);

  return (
    <div 
      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col md:flex-row group"
      id={`clinic-card-${clinic.id}`}
    >
      {/* Clinic Image & Badges */}
      <div className="relative md:w-64 h-48 md:h-auto shrink-0 bg-slate-100 overflow-hidden">
        <img
          src={coverImage}
          alt={clinic.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {clinic.status === 'verified' && (
            <span className="inline-flex items-center gap-1 bg-emerald-600/95 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verificada
            </span>
          )}
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white drop-shadow-md">
          <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md font-semibold">
            {clinic.location?.neighborhood || clinic.location?.municipality || 'Luanda'}
          </span>
        </div>
      </div>

      {/* Main Content Info */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating & Distance */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center text-amber-500 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                {clinic.ratingAverage}
              </div>
              <span className="text-slate-400 text-xs font-medium">({clinic.reviewsCount} avaliações)</span>
            </div>
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>{clinic.location?.municipality}, Luanda</span>
            </div>
          </div>

          {/* Clinic Name */}
          <h3 
            onClick={() => onViewClinic(clinic.slug)}
            className="text-lg font-bold text-slate-900 hover:text-teal-700 transition-colors cursor-pointer line-clamp-1"
          >
            {clinic.name}
          </h3>

          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {clinic.description}
          </p>

          {/* Featured Services Pills & Price */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {clinic.services.slice(0, 3).map((cs) => (
                <span 
                  key={cs.id}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                    cs.service_id === selectedServiceId
                      ? 'bg-teal-100 text-teal-800 border border-teal-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {cs.service?.name || 'Consulta'} · <strong className="text-slate-900">{formatPriceAOA(cs.price)}</strong>
                </span>
              ))}
              {clinic.services.length > 3 && (
                <span className="text-xs text-slate-400 px-1.5 py-1">
                  +{clinic.services.length - 3} outros
                </span>
              )}
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">A partir de</span>
              <span className="text-base font-extrabold text-teal-900 font-['Outfit',sans-serif]">
                {formatPriceAOA(clinic.minPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Slots & Action Buttons */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Available Slots Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 font-semibold shrink-0">Próximos:</span>
            {nextSlots.length > 0 ? (
              nextSlots.map(slot => {
                const date = new Date(slot.starts_at);
                const timeStr = date.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });
                return (
                  <button
                    key={slot.id}
                    onClick={() => onBookDirect(clinic.id, matchedService?.service_id)}
                    className="shrink-0 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs rounded-md font-semibold transition-colors"
                  >
                    {timeStr}
                  </button>
                );
              })
            ) : (
              <span className="text-xs text-slate-400">Verificar agenda completa</span>
            )}
          </div>

          {/* Main Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewClinic(clinic.slug)}
              className="px-3.5 py-2 rounded-xl text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
            >
              Ver Detalhes
            </button>
            <button
              onClick={() => onBookDirect(clinic.id, matchedService?.service_id)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-teal-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Marcar Consulta</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
