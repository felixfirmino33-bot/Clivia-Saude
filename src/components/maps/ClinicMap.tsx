import React, { useEffect, useRef } from 'react';
import { ClinicWithDetails } from '../../types';
import { formatPriceAOA } from '../../lib/notifications/whatsapp';
import L from 'leaflet';

interface ClinicMapProps {
  clinics: ClinicWithDetails[];
  selectedClinicId?: string | null;
  onSelectClinic: (clinic: ClinicWithDetails) => void;
  className?: string;
}

export const ClinicMap: React.FC<ClinicMapProps> = ({
  clinics,
  selectedClinicId,
  onSelectClinic,
  className = 'h-[420px] w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center of Lubango (Huíla), Angola
      const map = L.map(mapContainerRef.current, {
        center: [-14.9172, 13.4925],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker: L.Marker) => {
      marker.remove();
    });
    markersRef.current = {};

    const customIcon = L.divIcon({
      className: 'custom-clivia-marker',
      html: `
        <div style="background: linear-gradient(135deg, #0088FF, #004FB8); color: white; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0, 102, 214, 0.4); border: 2.5px solid white;">
          <div style="transform: rotate(45deg); font-weight: 800; font-size: 16px; line-height: 1;">+</div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -32]
    });

    const activeIcon = L.divIcon({
      className: 'custom-clivia-marker-active',
      html: `
        <div style="background: linear-gradient(135deg, #0d9488, #0f766e); color: white; width: 42px; height: 42px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 16px rgba(13, 148, 136, 0.5); border: 3px solid white;">
          <div style="transform: rotate(45deg); font-weight: 800; font-size: 20px; line-height: 1;">+</div>
        </div>
      `,
      iconSize: [42, 42],
      iconAnchor: [21, 42],
      popupAnchor: [0, -40]
    });

    const bounds = L.latLngBounds([]);

    clinics.forEach(clinic => {
      if (clinic.location?.latitude && clinic.location?.longitude) {
        const isSelected = selectedClinicId === clinic.id;
        const marker = L.marker([clinic.location.latitude, clinic.location.longitude], {
          icon: isSelected ? activeIcon : customIcon,
          title: clinic.name,
        }).addTo(map);

        const popupContent = document.createElement('div');
        popupContent.className = 'p-1 font-sans';
        popupContent.innerHTML = `
          <div style="font-family: 'Plus Jakarta Sans', sans-serif;">
            <div style="display: flex; align-items: center; gap: 4px; color: #0d9488; font-size: 11px; font-weight: 700; text-transform: uppercase;">
              <span>✓ Verificada</span> • <span>★ ${clinic.ratingAverage} (${clinic.reviewsCount})</span>
            </div>
            <h4 style="font-weight: 700; color: #0f172a; font-size: 14px; margin: 3px 0 2px 0;">${clinic.name}</h4>
            <p style="color: #64748b; font-size: 12px; margin: 0 0 6px 0;">${clinic.location.neighborhood || clinic.location.municipality}, Huíla</p>
            <div style="font-size: 12px; color: #0f3e36; font-weight: 700; margin-bottom: 8px;">
              A partir de ${formatPriceAOA(clinic.minPrice)}
            </div>
            <button id="btn-popup-${clinic.id}" style="width: 100%; background: #0066d6; color: white; border: none; padding: 6px 10px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer;">
              Ver Serviços e Marcar
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-popup-${clinic.id}`);
          if (btn) {
            btn.onclick = () => onSelectClinic(clinic);
          }
        });

        marker.on('click', () => {
          onSelectClinic(clinic);
        });

        markersRef.current[clinic.id] = marker;
        bounds.extend([clinic.location.latitude, clinic.location.longitude]);
      }
    });

    if (clinics.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

    return () => {
      // cleanup is handled on unmount
    };
  }, [clinics, selectedClinicId, onSelectClinic]);

  return (
    <div className={`relative ${className}`} id="clivia-interactive-map">
      <div ref={mapContainerRef} className="h-full w-full" />
      <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 shadow-sm text-xs font-semibold text-slate-700 flex items-center gap-1.5 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        Lubango, Huíla
      </div>
    </div>
  );
};
