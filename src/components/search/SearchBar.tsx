import React, { useState } from 'react';
import { Search, MapPin, Stethoscope, SlidersHorizontal, X } from 'lucide-react';
import { ServiceItem, Specialty, SearchFilterState } from '../../types';

interface SearchBarProps {
  services: ServiceItem[];
  specialties: Specialty[];
  filters: SearchFilterState;
  onFilterChange: (filters: Partial<SearchFilterState>) => void;
  onSearchSubmit: () => void;
}

const HUILA_MUNICIPALITIES = [
  'Todos os Municípios e Bairros (Huíla)',
  'Lubango — Centro / Bairro Comercial',
  'Lubango — Bairro da Lage',
  'Lubango — Nossa Senhora do Monte',
  'Lubango — Bairro Lucrécia / Mitcha',
  'Lubango — Bairro João de Almeida',
  'Lubango — Bairro da Mapunda',
  'Lubango — Bairro Santo António',
  'Humpata',
  'Chibia',
  'Matala',
  'Quipungo',
  'Cacula'
];

export const SearchBar: React.FC<SearchBarProps> = ({
  services,
  specialties,
  filters,
  onFilterChange,
  onSearchSubmit
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Group services by specialty
  const matchedServices = services.filter(s => 
    !filters.searchQuery || s.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-5xl mx-auto" id="clivia-search-bar-wrapper">
      {/* Primary Search Container */}
      <div 
        className={`bg-white rounded-2xl p-2.5 sm:p-3 shadow-xl border transition-all duration-200 ${
          isFocused ? 'border-teal-500 ring-4 ring-teal-500/10' : 'border-slate-200/80 shadow-slate-200/50'
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-3 items-center">
          
          {/* 1. Service / Exam input (PRIMARY) */}
          <div className="relative md:col-span-6 flex items-center px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition-colors">
            <Search className="w-5 h-5 text-teal-600 shrink-0 mr-2.5" />
            <div className="flex-1 relative">
              <input
                id="search-service-input"
                type="text"
                value={filters.searchQuery}
                onChange={(e) => {
                  onFilterChange({ searchQuery: e.target.value, selectedServiceId: null });
                  setShowDropdown(true);
                }}
                onFocus={() => {
                  setIsFocused(true);
                  setShowDropdown(true);
                }}
                onBlur={() => {
                  setIsFocused(false);
                  setTimeout(() => setShowDropdown(false), 250);
                }}
                placeholder="Pesquisar exame ou serviço (ex: ECG, Ecografia, Consulta...)"
                className="w-full bg-transparent border-none text-slate-800 placeholder:text-slate-400 text-sm sm:text-base font-medium focus:outline-none"
              />
            </div>
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => onFilterChange({ searchQuery: '', selectedServiceId: null })}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="Limpar pesquisa"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Dropdown with specific services */}
            {showDropdown && matchedServices.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 max-h-72 overflow-y-auto">
                <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Serviços e Exames Específicos
                </div>
                {matchedServices.map((service) => {
                  const spec = specialties.find(s => s.id === service.specialty_id);
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onFilterChange({
                          searchQuery: service.name,
                          selectedServiceId: service.id,
                          selectedSpecialtyId: service.specialty_id
                        });
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-teal-50 flex items-center justify-between text-sm transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-teal-600 shrink-0" />
                        <span className="font-semibold text-slate-800">{service.name}</span>
                      </div>
                      {spec && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                          {spec.name}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Municipality of Luanda Filter */}
          <div className="md:col-span-4 flex items-center px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition-colors">
            <MapPin className="w-5 h-5 text-teal-600 shrink-0 mr-2.5" />
            <div className="flex-1">
              <select
                id="filter-municipality-select"
                value={filters.municipality || ''}
                onChange={(e) => onFilterChange({ municipality: e.target.value === 'Todos os Municípios e Bairros (Huíla)' || !e.target.value ? null : e.target.value })}
                className="w-full bg-transparent border-none text-slate-800 text-sm font-medium focus:outline-none cursor-pointer"
              >
                {HUILA_MUNICIPALITIES.map((mun) => (
                  <option key={mun} value={mun === 'Todos os Municípios e Bairros (Huíla)' ? '' : mun}>
                    {mun}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Search Action Button */}
          <div className="md:col-span-2">
            <button
              id="btn-submit-search"
              type="button"
              onClick={onSearchSubmit}
              className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Pesquisar</span>
            </button>
          </div>

        </div>

        {/* Quick popular service chips in Angola */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs pb-0.5">
          <span className="text-slate-400 font-semibold shrink-0">Mais procurados na Huíla (Lubango):</span>
          {services.slice(0, 5).map((srv) => (
            <button
              key={srv.id}
              type="button"
              onClick={() => {
                onFilterChange({
                  searchQuery: srv.name,
                  selectedServiceId: srv.id,
                  selectedSpecialtyId: srv.specialty_id
                });
                onSearchSubmit();
              }}
              className={`shrink-0 px-2.5 py-1 rounded-lg border transition-all ${
                filters.selectedServiceId === srv.id 
                  ? 'bg-teal-700 text-white border-teal-700' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400 hover:text-teal-700'
              }`}
            >
              {srv.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
