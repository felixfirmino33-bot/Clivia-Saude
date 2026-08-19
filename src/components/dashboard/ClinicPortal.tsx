import React, { useState, useEffect, useRef } from 'react';
import { ClinicWithDetails, Appointment, DoctorSlot, Specialty } from '../../types';
import { dataStore } from '../../lib/supabase/client';
import { formatPriceAOA, generateWhatsAppDirectLink } from '../../lib/notifications/whatsapp';
import { ClinicMap } from '../maps/ClinicMap';
import { 
  Calendar, Users, Clock, CheckCircle, XCircle, MessageSquare, 
  Plus, AlertCircle, TrendingUp, Stethoscope, ChevronRight,
  Camera, Upload, Trash2, MapPin, Phone, Building2, Edit3,
  Check, Save, Eye, Sparkles, Filter, Search, ArrowUpRight,
  ChevronDown, Settings, Database, Image as ImageIcon, CloudUpload,
  ShieldCheck, CheckCircle2
} from 'lucide-react';

interface ClinicPortalProps {
  clinic: ClinicWithDetails;
  allClinics?: ClinicWithDetails[];
  onRefresh: () => void;
  onViewPublicProfile?: (slug: string) => void;
}

export const ClinicPortal: React.FC<ClinicPortalProps> = ({ 
  clinic: initialClinic, 
  allClinics: propAllClinics, 
  onRefresh, 
  onViewPublicProfile 
}) => {
  const allClinics = propAllClinics || dataStore.getAllClinics();
  
  // Selected clinic ID state to allow switching between any clinic
  const [selectedClinicId, setSelectedClinicId] = useState<string>(initialClinic.id);
  
  // Active clinic object
  const activeClinic = allClinics.find(c => c.id === selectedClinicId) || initialClinic;

  const [activeTab, setActiveTab] = useState<'appointments' | 'settings' | 'profile' | 'services' | 'doctors' | 'slots'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>(() => 
    dataStore.getAppointmentsForClinic(activeClinic.id)
  );

  // Filter state for appointments
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [appointmentSearch, setAppointmentSearch] = useState('');

  // Slot modal state
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [slotDate, setSlotDate] = useState(new Date().toISOString().split('T')[0]);
  const [slotTime, setSlotTime] = useState('09:00');
  const [isAddingSlot, setIsAddingSlot] = useState(false);

  // Clinic profile editing state - synced with activeClinic
  const [editName, setEditName] = useState(activeClinic.name);
  const [editDescription, setEditDescription] = useState(activeClinic.description || '');
  const [editPhone, setEditPhone] = useState(activeClinic.phone || '+244 ');
  const [editWhatsapp, setEditWhatsapp] = useState(activeClinic.whatsapp || '+244 ');
  const [editAddress, setEditAddress] = useState(activeClinic.location?.address || '');
  const [editProvince, setEditProvince] = useState(activeClinic.location?.province || 'Huíla');
  const [editMunicipality, setEditMunicipality] = useState(activeClinic.location?.municipality || 'Lubango');
  const [editNeighborhood, setEditNeighborhood] = useState(activeClinic.location?.neighborhood || 'Centro da Cidade');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [autoSetCover, setAutoSetCover] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [detectedLatitude, setDetectedLatitude] = useState<number | null>(activeClinic.location?.latitude ?? null);
  const [detectedLongitude, setDetectedLongitude] = useState<number | null>(activeClinic.location?.longitude ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add Service State
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState<number>(15000);
  const [newServiceSpecialtyId, setNewServiceSpecialtyId] = useState(dataStore.getSpecialties()[0]?.id || 'spec-1');
  const [isAddingService, setIsAddingService] = useState(false);

  // Add Doctor State
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newDoctorSpecialtyId, setNewDoctorSpecialtyId] = useState(dataStore.getSpecialties()[0]?.id || 'spec-1');
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);

  // Create New Clinic Modal State
  const [isCreatingClinic, setIsCreatingClinic] = useState(false);
  const [newClinicName, setNewClinicName] = useState('');
  const [newClinicPhone, setNewClinicPhone] = useState('+244 ');
  const [newClinicAddress, setNewClinicAddress] = useState('Lubango, Bairro ');
  const [newClinicNeighborhood, setNewClinicNeighborhood] = useState('Centro da Cidade');
  const [newClinicDesc, setNewClinicDesc] = useState('');

  // Notification / Feedback banner
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Synchronize internal state whenever activeClinic or selectedClinicId changes
  useEffect(() => {
    setEditName(activeClinic.name);
    setEditDescription(activeClinic.description || '');
    setEditPhone(activeClinic.phone || '+244 ');
    setEditWhatsapp(activeClinic.whatsapp || '+244 ');
    setEditAddress(activeClinic.location?.address || '');
    setEditProvince(activeClinic.location?.province || 'Huíla');
    setEditMunicipality(activeClinic.location?.municipality || 'Lubango');
    setEditNeighborhood(activeClinic.location?.neighborhood || 'Centro da Cidade');
    setDetectedLatitude(activeClinic.location?.latitude ?? null);
    setDetectedLongitude(activeClinic.location?.longitude ?? null);
    setSelectedDoctorId(activeClinic.doctors[0]?.id || '');
    setAppointments(dataStore.getAppointmentsForClinic(activeClinic.id));
  }, [
    activeClinic.id, 
    activeClinic.name, 
    activeClinic.description, 
    activeClinic.phone, 
    activeClinic.whatsapp, 
    activeClinic.location?.address, 
    activeClinic.location?.province,
    activeClinic.location?.municipality,
    activeClinic.location?.neighborhood,
    activeClinic.location?.latitude,
    activeClinic.location?.longitude
  ]);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleUpdateStatus = (appId: string, status: 'confirmed' | 'cancelled' | 'completed' | 'no_show') => {
    dataStore.updateAppointmentStatus(appId, status);
    setAppointments(dataStore.getAppointmentsForClinic(activeClinic.id));
    onRefresh();
    showFeedback(`Estado da consulta atualizado para ${status === 'confirmed' ? 'Confirmada' : status === 'completed' ? 'Concluída' : 'Cancelada'}.`);
  };

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const docId = selectedDoctorId || activeClinic.doctors[0]?.id;
    if (!docId) {
      showFeedback('Por favor adicione primeiro um médico no corpo clínico.', 'error');
      return;
    }

    const starts = new Date(`${slotDate}T${slotTime}:00`);
    const ends = new Date(starts.getTime() + 45 * 60000);

    dataStore.addDoctorSlot(activeClinic.id, docId, starts.toISOString(), ends.toISOString());
    setIsAddingSlot(false);
    onRefresh();
    showFeedback('Novo horário disponibilizado com sucesso na agenda online da clínica!');
  };

  const handleDeleteSlot = (slotId: string) => {
    const res = dataStore.deleteDoctorSlot(slotId);
    if (res.success) {
      onRefresh();
      showFeedback('Horário removido da agenda.');
    } else {
      showFeedback(res.error || 'Erro ao remover horário.', 'error');
    }
  };

  const handleAutoDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Este navegador não suporta geolocalização automática.');
      return;
    }

    setIsDetectingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setDetectedLatitude(latitude);
        setDetectedLongitude(longitude);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();

          const addr = data?.address || {};
          const formattedAddress = [
            data?.display_name || '',
            addr?.road || '',
            addr?.house_number || ''
          ].filter(Boolean).join(', ');

          const municipality = addr?.city || addr?.town || addr?.village || editMunicipality || 'Lubango';
          const province = addr?.state || editProvince || 'Huíla';
          const neighborhood = addr?.suburb || addr?.neighbourhood || addr?.quarter || editNeighborhood || 'Centro da Cidade';

          setEditAddress(formattedAddress || editAddress || 'Lubango, Província da Huíla');
          setEditMunicipality(municipality);
          setEditProvince(province);
          setEditNeighborhood(neighborhood);
          setLocationError(null);
        } catch {
          setLocationError('A localização foi obtida, mas não foi possível completar o endereço automaticamente.');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      () => {
        setLocationError('Não foi possível obter a sua localização. Verifique as permissões do navegador e tente novamente.');
        setIsDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDetails(true);

    const res = await dataStore.updateClinicDetails(activeClinic.id, {
      name: editName,
      description: editDescription,
      phone: editPhone,
      whatsapp: editWhatsapp,
      address: editAddress,
      province: editProvince,
      municipality: editMunicipality,
      neighborhood: editNeighborhood,
      latitude: detectedLatitude ?? activeClinic.location?.latitude ?? -14.9185,
      longitude: detectedLongitude ?? activeClinic.location?.longitude ?? 13.4942
    });

    setIsSavingDetails(false);

    if (res.success) {
      onRefresh();
      showFeedback(`Dados de "${editName}" e localização na tabela clinic_locations guardados com sucesso!`);
    } else {
      showFeedback(res.error || 'Erro ao guardar dados e localização.', 'error');
    }
  };

  // Supabase Storage Image Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showFeedback('Por favor selecione um ficheiro de imagem válido (PNG, JPG, WEBP).', 'error');
      return;
    }

    setImageUploadLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const res = await dataStore.uploadClinicImageToStorage(
        activeClinic.id, 
        dataUrl, 
        file.name, 
        autoSetCover || activeClinic.images.length === 0
      );
      setImageUploadLoading(false);
      if (res.success) {
        onRefresh();
        showFeedback('Foto enviada para o Supabase Storage e registada na tabela clinic_images com sucesso!');
      } else {
        showFeedback(res.error || 'Erro ao carregar imagem para o Supabase Storage.', 'error');
      }
    };
    reader.onerror = () => {
      setImageUploadLoading(false);
      showFeedback('Erro ao processar ficheiro de imagem.', 'error');
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handler
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showFeedback('Por favor arraste um ficheiro de imagem válido (PNG, JPG, WEBP).', 'error');
      return;
    }

    setImageUploadLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const res = await dataStore.uploadClinicImageToStorage(
        activeClinic.id, 
        dataUrl, 
        file.name, 
        autoSetCover || activeClinic.images.length === 0
      );
      setImageUploadLoading(false);
      if (res.success) {
        onRefresh();
        showFeedback('Foto enviada para o Supabase Storage e registada na tabela clinic_images com sucesso!');
      } else {
        showFeedback(res.error || 'Erro ao carregar imagem para o Supabase Storage.', 'error');
      }
    };
    reader.onerror = () => {
      setImageUploadLoading(false);
      showFeedback('Erro ao processar ficheiro de imagem.', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleAddImageUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) return;

    setImageUploadLoading(true);
    const res = await dataStore.uploadClinicImageToStorage(
      activeClinic.id, 
      imageUrlInput.trim(), 
      'external-image.jpg', 
      autoSetCover || activeClinic.images.length === 0
    );
    setImageUploadLoading(false);

    if (res.success) {
      setImageUrlInput('');
      onRefresh();
      showFeedback('Foto adicionada ao Supabase Storage e registada na tabela clinic_images!');
    } else {
      showFeedback(res.error || 'Erro ao adicionar imagem.', 'error');
    }
  };

  const handleRemoveImage = (imageId: string) => {
    const res = dataStore.removeClinicImage(activeClinic.id, imageId);
    if (res.success) {
      onRefresh();
      showFeedback('Foto removida da galeria.');
    } else {
      showFeedback(res.error || 'Erro ao remover foto.', 'error');
    }
  };

  const handleSetCoverImage = (imageId: string) => {
    const res = dataStore.setCoverClinicImage(activeClinic.id, imageId);
    if (res.success) {
      onRefresh();
      showFeedback('Foto de capa principal atualizada!');
    } else {
      showFeedback(res.error || 'Erro ao atualizar capa.', 'error');
    }
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) {
      showFeedback('Informe o nome do exame ou serviço.', 'error');
      return;
    }
    if (newServicePrice <= 0) {
      showFeedback('O preço deve ser superior a 0 Kz.', 'error');
      return;
    }

    const res = dataStore.addClinicService(activeClinic.id, {
      name: newServiceName.trim(),
      price: Number(newServicePrice),
      specialtyId: newServiceSpecialtyId
    });

    if (res.success) {
      setNewServiceName('');
      setNewServicePrice(15000);
      setIsAddingService(false);
      onRefresh();
      showFeedback(`Serviço "${newServiceName.trim()}" adicionado com sucesso!`);
    } else {
      showFeedback(res.error || 'Erro ao adicionar serviço.', 'error');
    }
  };

  const handleRemoveService = (serviceId: string) => {
    const res = dataStore.removeClinicService(activeClinic.id, serviceId);
    if (res.success) {
      onRefresh();
      showFeedback('Serviço removido do preçário.');
    } else {
      showFeedback(res.error || 'Erro ao remover serviço.', 'error');
    }
  };

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctorName.trim()) {
      showFeedback('Informe o nome do médico.', 'error');
      return;
    }

    const res = dataStore.addDoctor(activeClinic.id, {
      full_name: newDoctorName.trim(),
      specialty_id: newDoctorSpecialtyId
    });

    if (res.success) {
      setNewDoctorName('');
      setIsAddingDoctor(false);
      onRefresh();
      showFeedback(`Médico ${newDoctorName.trim()} adicionado ao corpo clínico!`);
    } else {
      showFeedback(res.error || 'Erro ao adicionar médico.', 'error');
    }
  };

  const handleRemoveDoctor = (doctorId: string) => {
    const res = dataStore.removeDoctor(activeClinic.id, doctorId);
    if (res.success) {
      onRefresh();
      showFeedback('Médico removido do corpo clínico.');
    } else {
      showFeedback(res.error || 'Erro ao remover médico.', 'error');
    }
  };

  const handleCreateNewClinic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClinicName.trim()) {
      showFeedback('Informe o nome da clínica.', 'error');
      return;
    }

    const res = dataStore.createClinic({
      name: newClinicName.trim(),
      description: newClinicDesc.trim(),
      phone: newClinicPhone.trim(),
      whatsapp: newClinicPhone.trim(),
      address: newClinicAddress.trim(),
      neighborhood: newClinicNeighborhood.trim()
    });

    if (res.success && res.clinic) {
      setIsCreatingClinic(false);
      setSelectedClinicId(res.clinic.id);
      onRefresh();
      showFeedback(`Perfil da clínica "${res.clinic.name}" criado com sucesso! Pode agora adicionar serviços e fotos.`);
    } else {
      showFeedback(res.error || 'Erro ao criar perfil de clínica.', 'error');
    }
  };

  // Calculations
  const totalRevenue = appointments
    .filter(a => a.status === 'completed' || a.status === 'confirmed')
    .reduce((acc, a) => {
      const cs = activeClinic.services.find(s => s.service_id === a.service_id);
      return acc + (cs?.price || 0);
    }, 0);

  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const slots = dataStore.getSlotsForClinic(activeClinic.id);
  const openSlotsCount = slots.filter(s => s.status === 'open').length;

  const specialties = dataStore.getSpecialties();
  const coverImage = activeClinic.images.find(img => img.is_cover)?.url || activeClinic.images[0]?.url;

  // Filtered appointments
  const filteredAppointments = appointments.filter(app => {
    if (appointmentFilter !== 'all' && app.status !== appointmentFilter) return false;
    if (appointmentSearch.trim()) {
      const q = appointmentSearch.toLowerCase();
      const matchName = app.patient_name?.toLowerCase().includes(q);
      const matchPhone = app.patient_phone?.toLowerCase().includes(q);
      const matchService = app.service?.name?.toLowerCase().includes(q);
      return matchName || matchPhone || matchService;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6" id="clivia-clinic-portal">
      
      {/* Top Clinic Switcher Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              A Gerir Perfil da Clínica:
            </span>
            <div className="flex items-center gap-2">
              <select
                value={selectedClinicId}
                onChange={(e) => setSelectedClinicId(e.target.value)}
                className="text-xs sm:text-sm font-extrabold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-teal-600 cursor-pointer"
              >
                {allClinics.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.location?.neighborhood ? `(${c.location.neighborhood})` : ''}
                  </option>
                ))}
              </select>
              <span className="text-[10px] bg-teal-100 text-teal-900 font-bold px-2 py-0.5 rounded-full">
                {activeClinic.services.length} serviços
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onViewPublicProfile && (
            <button
              onClick={() => onViewPublicProfile(activeClinic.slug)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>Ver no Marketplace</span>
            </button>
          )}

          <button
            onClick={() => setIsCreatingClinic(true)}
            className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar Outra Clínica</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className={`p-4 rounded-2xl border text-sm font-semibold flex items-center justify-between gap-3 animate-fade-in ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button 
            onClick={() => setFeedbackMsg(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Clinic Header Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-teal-800/40 relative overflow-hidden">
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 relative z-10">
          {/* Cover Avatar */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-teal-400/40 bg-slate-800 shrink-0 shadow-lg relative group">
            {coverImage ? (
              <img 
                src={coverImage} 
                alt={activeClinic.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-teal-900 text-teal-200 font-extrabold text-2xl">
                {activeClinic.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider bg-teal-800/80 border border-teal-700 px-3 py-0.5 rounded-full">
                Painel da Clínica · Huíla (Lubango)
              </span>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span>Perfil Ativo</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit',sans-serif] text-white">
              {activeClinic.name}
            </h1>

            <p className="text-xs sm:text-sm text-teal-100/80 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>{activeClinic.location?.address || 'Lubango, Huíla'}</span>
            </p>
          </div>
        </div>

        {/* Action Button & Quick Stats */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
          <div className="text-right">
            <span className="text-[10px] text-teal-200 block uppercase font-semibold">Volume Estimado</span>
            <span className="text-lg sm:text-xl font-extrabold font-['Outfit',sans-serif] text-emerald-400">
              {formatPriceAOA(totalRevenue)}
            </span>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="text-right">
            <span className="text-[10px] text-teal-200 block uppercase font-semibold">Marcações</span>
            <span className="text-lg sm:text-xl font-extrabold text-white">{appointments.length}</span>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Marcações</span>
          <div className="text-2xl font-black text-slate-900 font-['Outfit',sans-serif]">
            {appointments.length}
          </div>
          <div className="text-[11px] text-slate-400">
            <span className="text-amber-600 font-bold">{pendingCount}</span> pendentes
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Volume Estimado</span>
          <div className="text-2xl font-black text-teal-800 font-['Outfit',sans-serif]">
            {formatPriceAOA(totalRevenue)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>{completedCount} consultas realizadas</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Serviços no Preçário</span>
          <div className="text-2xl font-black text-slate-900 font-['Outfit',sans-serif]">
            {activeClinic.services.length}
          </div>
          <div className="text-[11px] text-slate-400">
            A partir de {formatPriceAOA(activeClinic.minPrice || 0)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Vagas na Agenda</span>
          <div className="text-2xl font-black text-emerald-700 font-['Outfit',sans-serif]">
            {openSlotsCount}
          </div>
          <div className="text-[11px] text-slate-400">
            {activeClinic.doctors.length} médicos cadastrados
          </div>
        </div>
      </div>

      {/* Create New Clinic Modal */}
      {isCreatingClinic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600" />
                <h2 className="text-lg font-bold text-slate-900">Cadastrar Nova Clínica em Lubango</h2>
              </div>
              <button 
                onClick={() => setIsCreatingClinic(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewClinic} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Nome da Clínica ou Centro Médico *
                </label>
                <input
                  type="text"
                  required
                  value={newClinicName}
                  onChange={(e) => setNewClinicName(e.target.value)}
                  placeholder="Ex: Policlínica Central do Lubango"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Telefone de Atendimento *
                  </label>
                  <input
                    type="text"
                    required
                    value={newClinicPhone}
                    onChange={(e) => setNewClinicPhone(e.target.value)}
                    placeholder="+244 923 000 000"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Bairro no Lubango
                  </label>
                  <select
                    value={newClinicNeighborhood}
                    onChange={(e) => setNewClinicNeighborhood(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-semibold"
                  >
                    <option value="Centro da Cidade">Centro da Cidade</option>
                    <option value="Bairro Comercial">Bairro Comercial</option>
                    <option value="Bairro da Lage">Bairro da Lage</option>
                    <option value="Lucrécia">Lucrécia</option>
                    <option value="Mapunda">Mapunda</option>
                    <option value="Comandante Cow-boy">Comandante Cow-boy</option>
                    <option value="Santo António">Santo António</option>
                    <option value="Cristo Rei">Cristo Rei</option>
                    <option value="Mitcha">Mitcha</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Endereço Completo & Ponto de Referência
                </label>
                <input
                  type="text"
                  value={newClinicAddress}
                  onChange={(e) => setNewClinicAddress(e.target.value)}
                  placeholder="Rua ou Avenida, junto ao Largo..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Breve Apresentação dos Serviços
                </label>
                <textarea
                  rows={2}
                  value={newClinicDesc}
                  onChange={(e) => setNewClinicDesc(e.target.value)}
                  placeholder="Especialidades, horário de urgência, exames disponíveis..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-semibold"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingClinic(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Criar Perfil da Clínica
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 flex flex-wrap gap-1 shadow-xs">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'appointments'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Marcações ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 min-w-[160px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'settings' || activeTab === 'profile'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Configurações da Clínica</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'services'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Serviços & Preçário ({activeClinic.services.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('doctors')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'doctors'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Corpo Clínico ({activeClinic.doctors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('slots')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'slots'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Agenda & Horários ({openSlotsCount})</span>
        </button>
      </div>

      {/* TAB 1: APPOINTMENTS / PEDIDOS DE CONSULTA */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Pedidos de Consulta e Marcações de {activeClinic.name}</h2>
              <p className="text-xs text-slate-500">
                Receba pedidos em tempo real, confirme consultas e envie lembretes automáticos para o WhatsApp dos pacientes.
              </p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setAppointmentFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  appointmentFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Todas ({appointments.length})
              </button>
              <button
                onClick={() => setAppointmentFilter('pending')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  appointmentFilter === 'pending' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Pendentes ({pendingCount})
              </button>
              <button
                onClick={() => setAppointmentFilter('confirmed')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  appointmentFilter === 'confirmed' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Confirmadas ({confirmedCount})
              </button>
              <button
                onClick={() => setAppointmentFilter('completed')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  appointmentFilter === 'completed' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Concluídas ({completedCount})
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={appointmentSearch}
              onChange={(e) => setAppointmentSearch(e.target.value)}
              placeholder="Pesquisar por nome do paciente, telefone ou tipo de serviço..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-semibold"
            />
          </div>

          {filteredAppointments.length > 0 ? (
            <div className="space-y-3">
              {filteredAppointments.map((app) => {
                const service = activeClinic.services.find(s => s.service_id === app.service_id);
                const starts = app.slot ? new Date(app.slot.starts_at) : new Date(app.created_at);
                
                // WhatsApp reminder link
                const reminderMsg = `*CONFIRMAÇÃO DE CONSULTA — ${activeClinic.name.toUpperCase()} (LUBANGO)*\n\nOlá ${app.patient_name}, confirmamos a sua consulta de *${app.service?.name || 'Serviço Médico'}* no dia *${starts.toLocaleDateString('pt-AO')} às ${starts.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}*.\n\nLocal: ${activeClinic.location?.address || 'Lubango, Huíla'}\nValor: ${formatPriceAOA(service?.price)}\n\nAguardamos por si!`;
                const reminderLink = generateWhatsAppDirectLink(app.patient_phone || '+244923000000', reminderMsg);

                return (
                  <div
                    key={app.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          #{app.id.slice(-6).toUpperCase()}
                        </span>
                        <strong className="text-sm text-slate-900 font-extrabold">{app.patient_name}</strong>
                        
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          app.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                          app.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          app.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {app.status === 'confirmed' ? '✓ Confirmada' :
                           app.status === 'completed' ? '✓ Atendimento Concluído' :
                           app.status === 'cancelled' ? '✕ Cancelada' : '⏳ Pendente de Confirmação'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="font-semibold text-slate-800">🩺 {app.service?.name}</span>
                        <span>📅 {starts.toLocaleDateString('pt-AO')} às {starts.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>📞 {app.patient_phone}</span>
                        {app.doctor && <span>👨‍⚕️ {app.doctor.full_name}</span>}
                        <strong className="text-teal-800 font-extrabold font-['Outfit',sans-serif]">
                          {formatPriceAOA(service?.price)}
                        </strong>
                      </div>

                      {app.notes && (
                        <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 mt-1 italic">
                          Nota do Paciente: "{app.notes}"
                        </p>
                      )}
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <a
                        href={reminderLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#1EBE5D] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Notificar WhatsApp</span>
                      </a>

                      {app.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'confirmed')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-sm"
                        >
                          Confirmar Pedido
                        </button>
                      )}

                      {app.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'completed')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-sm"
                        >
                          Concluir Consulta
                        </button>
                      )}

                      {app.status !== 'cancelled' && (
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'cancelled')}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm text-slate-700 font-bold">Nenhuma marcação registada para esta clínica</p>
              <p className="text-xs text-slate-400">Quando os pacientes marcarem consultas no Lubango, os pedidos aparecerão aqui imediatamente.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CONFIGURAÇÕES DA CLÍNICA & UPLOAD SUPABASE STORAGE */}
      {(activeTab === 'settings' || activeTab === 'profile') && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Card for Settings */}
          <div className="bg-gradient-to-r from-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <Database className="w-3 h-3 text-teal-400" />
                  <span>Supabase Storage · Bucket: clinic_images</span>
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded-full">
                  Tabela: clinic_images
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-['Outfit',sans-serif]">
                Configurações da Clínica & Gestão de Imagens
              </h2>
              <p className="text-xs text-slate-300">
                Faça upload de fotos para o bucket do Supabase Storage e configure os dados oficiais da unidade em Lubango.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-teal-300 bg-teal-900/60 border border-teal-700/60 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>{activeClinic.images?.length || 0} Fotos Sincronizadas</span>
              </span>
            </div>
          </div>

          {/* Photos Management Section with Supabase Storage Bucket */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CloudUpload className="w-5 h-5 text-teal-600" />
                  <span>Upload de Fotos (Supabase Storage Bucket: clinic_images)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  As imagens são guardadas no Supabase Storage e associadas diretamente à clínica na tabela <code className="text-teal-700 font-mono bg-teal-50 px-1 py-0.5 rounded">clinic_images</code>.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageUploadLoading}
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{imageUploadLoading ? 'A processar upload...' : 'Selecionar do Computador / Telemóvel'}</span>
                </button>
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-3 ${
                isDragOver 
                  ? 'border-teal-500 bg-teal-50/70 scale-[0.99]' 
                  : 'border-slate-300 hover:border-teal-400 bg-slate-50/60 hover:bg-teal-50/30'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-100/80 text-teal-700 flex items-center justify-center">
                <CloudUpload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  Arraste e solte fotos da clínica aqui ou <span className="text-teal-600 underline">clique para procurar</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Formatos suportados: PNG, JPG, JPEG, WEBP · Armazenadas no bucket seguro de imagens
                </p>
              </div>

              {/* Cover toggle on upload */}
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="flex items-center gap-2 pt-2 text-xs font-semibold text-slate-600 cursor-pointer"
              >
                <input
                  type="checkbox"
                  id="autoCoverCheck"
                  checked={autoSetCover}
                  onChange={(e) => setAutoSetCover(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="autoCoverCheck" className="cursor-pointer select-none">
                  Definir automaticamente o próximo upload como <span className="font-bold text-teal-800">Foto de Capa Principal</span>
                </label>
              </div>
            </div>

            {/* URL Input Option */}
            <div className="pt-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                Ou carregue a partir de um URL web para o Supabase:
              </label>
              <form onSubmit={handleAddImageUrl} className="flex gap-2">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://exemplo.com/fotos/fachada-clinica.jpg"
                  className="flex-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-medium"
                />
                <button
                  type="submit"
                  disabled={imageUploadLoading || !imageUrlInput.trim()}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer shrink-0 transition-colors"
                >
                  Carregar URL
                </button>
              </form>
            </div>

            {/* Images Grid (Synced with clinic_images table) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Galeria de Fotos Cadastradas ({activeClinic.images?.length || 0})
                </span>
                <span className="text-[11px] text-slate-400">
                  Passe o cursor por cima para definir como capa ou eliminar
                </span>
              </div>

              {activeClinic.images && activeClinic.images.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {activeClinic.images.map((img) => (
                    <div 
                      key={img.id}
                      className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video shadow-xs transition-all hover:shadow-md"
                    >
                      <img
                        src={img.url}
                        alt="Foto da Clínica"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Cover Badge */}
                      {img.is_cover ? (
                        <span className="absolute top-2 left-2 bg-teal-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Capa Principal</span>
                        </span>
                      ) : (
                        <span className="absolute top-2 left-2 bg-slate-900/70 text-slate-200 text-[9px] font-semibold px-1.5 py-0.5 rounded backdrop-blur-xs">
                          Galeria
                        </span>
                      )}

                      {/* Storage Bucket Tag */}
                      <span className="absolute bottom-2 left-2 bg-slate-900/80 text-teal-300 text-[9px] font-mono px-1.5 py-0.5 rounded backdrop-blur-xs">
                        clinic_images
                      </span>

                      {/* Actions Overlay */}
                      <div className="absolute inset-0 bg-slate-950/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                        {!img.is_cover && (
                          <button
                            type="button"
                            onClick={() => handleSetCoverImage(img.id)}
                            className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors shadow-xs"
                          >
                            Definir Capa
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.id)}
                          className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer transition-colors"
                          title="Eliminar foto do Supabase Storage"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-1">
                  <ImageIcon className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">Nenhuma foto carregada para esta clínica</p>
                  <p className="text-[11px] text-slate-400">Faça o upload da primeira foto para torná-la a capa no marketplace de Lubango.</p>
                </div>
              )}
            </div>
          </div>

          {/* Details & Location Form with clinic_locations sync */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-teal-600" />
                  <span>Dados Oficiais, Contactos e Localização (Tabela: clinic_locations)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Atualize as informações cadastrais e a localização geográfica precisa da unidade para pesquisa no marketplace.
                </p>
              </div>

              <span className="text-[11px] font-extrabold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 self-start sm:self-auto">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                <span>clinic_locations: {editMunicipality}, {editProvince}</span>
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Basic Info */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Nome Oficial da Clínica ou Centro Médico *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-semibold"
                  placeholder="Ex: Centro Médico Sagrada Esperança - Lubango"
                />
              </div>

              {/* Geographic Location (clinic_locations table) */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Localização e Morada Oficial (Tabela: clinic_locations)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoDetectLocation}
                    disabled={isDetectingLocation}
                    className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-[11px] font-bold text-teal-800 hover:bg-teal-100 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{isDetectingLocation ? 'A localizar...' : 'Usar a minha localização'}</span>
                  </button>
                </div>

                {locationError && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800 font-medium">
                    {locationError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Província *
                    </label>
                    <input
                      type="text"
                      required
                      value={editProvince}
                      onChange={(e) => setEditProvince(e.target.value)}
                      placeholder="Huíla"
                      className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Município *
                    </label>
                    <input
                      type="text"
                      required
                      value={editMunicipality}
                      onChange={(e) => setEditMunicipality(e.target.value)}
                      placeholder="Lubango"
                      className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Bairro / Zona *
                    </label>
                    <input
                      type="text"
                      required
                      value={editNeighborhood}
                      onChange={(e) => setEditNeighborhood(e.target.value)}
                      placeholder="Centro da Cidade"
                      className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Endereço Completo e Ponto de Referência (Rua / Edifício) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Ex: Rua Dr. António Agostinho Neto, junto ao Largo 1º de Maio, Lubango"
                    className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-semibold"
                  />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-2">
                  <ClinicMap
                    clinics={[
                      {
                        ...activeClinic,
                        location: {
                          ...activeClinic.location,
                          latitude: detectedLatitude ?? activeClinic.location?.latitude ?? -14.9185,
                          longitude: detectedLongitude ?? activeClinic.location?.longitude ?? 13.4942,
                          address: editAddress || activeClinic.location?.address || 'Lubango, Huíla',
                          province: editProvince || activeClinic.location?.province || 'Huíla',
                          municipality: editMunicipality || activeClinic.location?.municipality || 'Lubango',
                          neighborhood: editNeighborhood || activeClinic.location?.neighborhood || 'Centro da Cidade',
                          id: activeClinic.location?.id || `loc-${activeClinic.id}`,
                          clinic_id: activeClinic.id
                        }
                      }
                    ]}
                    selectedClinicId={activeClinic.id}
                    onSelectClinic={() => undefined}
                    className="h-[220px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner"
                  />
                </div>
              </div>

              {/* Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Telefone de Chamadas (Angola)
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+244 923 000 000"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    WhatsApp para Confirmação de Consultas
                  </label>
                  <input
                    type="text"
                    value={editWhatsapp}
                    onChange={(e) => setEditWhatsapp(e.target.value)}
                    placeholder="+244 923 000 000"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-semibold"
                  />
                </div>
              </div>

              {/* Institutional Presentation */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Descrição Institucional e Serviços de Urgência
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Apresente os diferenciais, instalações, equipamentos médicos e horários de urgência..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-semibold"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-slate-400">
                  Os dados são salvos localmente e sincronizados nas tabelas <code className="text-teal-700 font-mono">clinics</code> e <code className="text-teal-700 font-mono">clinic_locations</code> do Supabase.
                </p>

                <button
                  type="submit"
                  disabled={isSavingDetails}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingDetails ? 'A guardar alterações...' : 'Guardar Configurações e Localização'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: SERVICES & PRICING */}
      {activeTab === 'services' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <span>Serviços Médicos e Preçário em Kwanzas (AOA) de {activeClinic.name}</span>
              </h2>
              <p className="text-xs text-slate-500">
                Adicione exames, consultas e tratamentos com os respetivos valores para os pacientes do Lubango.
              </p>
            </div>

            <button
              onClick={() => setIsAddingService(true)}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Novo Serviço</span>
            </button>
          </div>

          {/* Add Service Modal Form */}
          {isAddingService && (
            <form onSubmit={handleAddService} className="bg-teal-50/70 border border-teal-200 rounded-2xl p-5 space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-teal-950">Novo Exame ou Consulta no Preçário</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Especialidade *
                  </label>
                  <select
                    value={newServiceSpecialtyId}
                    onChange={(e) => setNewServiceSpecialtyId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    {specialties.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Nome do Serviço ou Exame *
                  </label>
                  <input
                    type="text"
                    required
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    placeholder="Ex: Ecografia Obstétrica, Check-up Básico"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Preço em Kwanzas (AOA) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={500}
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingService(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Adicionar ao Preçário
                </button>
              </div>
            </form>
          )}

          {/* Services List */}
          <div className="divide-y divide-slate-100">
            {activeClinic.services.map((cs) => (
              <div key={cs.id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <strong className="text-sm text-slate-900 block font-bold">{cs.service?.name}</strong>
                  <span className="text-xs text-teal-800 bg-teal-50 px-2 py-0.5 rounded font-semibold inline-block mt-0.5">
                    {cs.specialty?.name || 'Geral'}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-base font-extrabold text-teal-900 font-['Outfit',sans-serif]">
                    {formatPriceAOA(cs.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveService(cs.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Remover serviço"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DOCTORS & SPECIALTIES */}
      {activeTab === 'doctors' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                <span>Corpo Clínico & Especialistas de {activeClinic.name}</span>
              </h2>
              <p className="text-xs text-slate-500">
                Cadastre os médicos e profissionais que atendem nesta clínica em Lubango.
              </p>
            </div>

            <button
              onClick={() => setIsAddingDoctor(true)}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Médico</span>
            </button>
          </div>

          {/* Add Doctor Form */}
          {isAddingDoctor && (
            <form onSubmit={handleAddDoctor} className="bg-teal-50/70 border border-teal-200 rounded-2xl p-5 space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-teal-950">Novo Médico Responsável</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Nome Completo do Médico *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDoctorName}
                    onChange={(e) => setNewDoctorName(e.target.value)}
                    placeholder="Ex: Dr. Afonso Bento"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Especialidade Principal *
                  </label>
                  <select
                    value={newDoctorSpecialtyId}
                    onChange={(e) => setNewDoctorSpecialtyId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    {specialties.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingDoctor(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Cadastrar Médico
                </button>
              </div>
            </form>
          )}

          {/* Doctors List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {activeClinic.doctors.map((doc) => (
              <div key={doc.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-extrabold text-sm shrink-0">
                    {doc.full_name.charAt(0)}
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block">{doc.full_name}</strong>
                    <span className="text-[11px] text-teal-700 font-semibold">{doc.specialty?.name || 'Clínica Geral'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveDoctor(doc.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Remover médico"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SLOTS & SCHEDULE MANAGEMENT */}
      {activeTab === 'slots' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600" />
                <span>Agenda e Horários de Consulta Online de {activeClinic.name}</span>
              </h2>
              <p className="text-xs text-slate-500">
                Abra horários para que os pacientes possam marcar consultas diretamente na plataforma.
              </p>
            </div>

            <button
              onClick={() => setIsAddingSlot(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Abrir Novo Horário</span>
            </button>
          </div>

          {/* Add Slot Form */}
          {isAddingSlot && (
            <form onSubmit={handleCreateSlot} className="bg-teal-50/70 border border-teal-200 rounded-2xl p-5 space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-teal-950">Novo Horário de Atendimento</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Médico Responsável *</label>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    {activeClinic.doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.full_name} ({d.specialty?.name || 'Geral'})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={slotDate}
                    onChange={(e) => setSlotDate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Hora de Início *</label>
                  <input
                    type="time"
                    required
                    value={slotTime}
                    onChange={(e) => setSlotTime(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddingSlot(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Publicar Vaga
                </button>
              </div>
            </form>
          )}

          {/* Slots Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Vagas Disponíveis na Plataforma</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {slots.map((slot) => {
                const date = new Date(slot.starts_at);
                const isOpen = slot.status === 'open';
                return (
                  <div
                    key={slot.id}
                    className={`p-3 rounded-2xl border text-center text-xs relative group transition-all ${
                      isOpen
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}
                  >
                    <span className="block text-[10px] text-slate-500 uppercase font-bold">
                      {date.toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' })}
                    </span>
                    <span className="block text-sm font-extrabold mt-0.5 font-['Outfit',sans-serif]">
                      {date.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`text-[10px] font-bold mt-1 block px-2 py-0.5 rounded-full ${
                      isOpen ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {isOpen ? 'Disponível' : 'Ocupado'}
                    </span>

                    {isOpen && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="absolute top-1 right-1 p-1 bg-white hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-md shadow-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Eliminar vaga"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
