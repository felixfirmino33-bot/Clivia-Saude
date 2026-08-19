import React, { useState, useEffect } from 'react';
import { ClinicWithDetails, DoctorSlot, ServiceItem, Doctor, Appointment } from '../../types';
import { dataStore } from '../../lib/supabase/client';
import { formatPriceAOA, buildPatientWhatsAppMessage, generateWhatsAppDirectLink } from '../../lib/notifications/whatsapp';
import { X, Calendar, Clock, User, Phone, CheckCircle2, AlertCircle, MessageSquare, ShieldCheck, Stethoscope, ChevronRight } from 'lucide-react';

interface BookingModalProps {
  clinic: ClinicWithDetails;
  initialServiceId?: string;
  initialDoctorId?: string;
  onClose: () => void;
  onBookingSuccess: (appointment: Appointment) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  clinic,
  initialServiceId,
  initialDoctorId,
  onClose,
  onBookingSuccess
}) => {
  const currentUser = dataStore.getCurrentUser();

  // Booking Flow Steps: 1: Service & Doctor, 2: Date & Slot, 3: Patient Info, 4: Confirmed
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form selections
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialServiceId || clinic.services[0]?.service_id || ''
  );
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    initialDoctorId || clinic.doctors[0]?.id || ''
  );
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // Patient inputs (Validated for Angola)
  const [patientName, setPatientName] = useState<string>(currentUser?.full_name || '');
  const [patientPhone, setPatientPhone] = useState<string>(currentUser?.phone || '+244 9');
  const [patientNotes, setPatientNotes] = useState<string>('');

  // Execution states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Slots for the clinic
  const [availableSlots, setAvailableSlots] = useState<DoctorSlot[]>([]);

  useEffect(() => {
    // Refresh slots
    const slots = dataStore.getOpenSlotsForClinic(clinic.id, selectedDoctorId || undefined);
    setAvailableSlots(slots);
  }, [clinic.id, selectedDoctorId]);

  // Selected details
  const selectedClinicService = clinic.services.find(s => s.service_id === selectedServiceId);
  const selectedDoctor = clinic.doctors.find(d => d.id === selectedDoctorId);

  // Date buttons (Today + 4 days)
  const dateOptions = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      iso: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : d.toLocaleDateString('pt-AO', { weekday: 'short' }),
      formatted: d.toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' })
    };
  });

  // Filter slots for selected date
  const dateSlots = availableSlots.filter(s => {
    const slotDate = s.starts_at.split('T')[0];
    return slotDate === selectedDate;
  });

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotId) {
      setErrorMessage('Por favor selecione um horário para a consulta.');
      return;
    }
    if (!patientName.trim()) {
      setErrorMessage('Por favor preencha o seu nome completo.');
      return;
    }
    if (!patientPhone || patientPhone.trim().length < 9) {
      setErrorMessage('Por favor indique um número de WhatsApp válido em Angola (ex: 923 123 456).');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const patientId = currentUser?.id || `anon-${Date.now()}`;
      
      // Execute Atomic Book Slot RPC
      const result = await dataStore.bookSlot({
        slotId: selectedSlotId,
        patientId,
        serviceId: selectedServiceId,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        notes: patientNotes.trim()
      });

      if (!result.success || !result.appointment) {
        setErrorMessage(result.error || 'Não foi possível confirmar a marcação. Tente outro horário.');
        setIsLoading(false);
        return;
      }

      setConfirmedAppointment(result.appointment);
      setStep(4);
      onBookingSuccess(result.appointment);
    } catch {
      setErrorMessage('Ocorreu um erro ao processar a reserva. Verifique a sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-800 to-teal-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 text-teal-200 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Marcação Segura · {clinic.name}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-['Outfit',sans-serif]">
            {step === 4 ? 'Marcação Confirmada!' : 'Agendar Consulta / Exame'}
          </h2>
          <p className="text-xs sm:text-sm text-teal-100/80 mt-1">
            {clinic.location?.address || `${clinic.location?.municipality || 'Lubango'}, Huíla`}
          </p>

          {/* Stepper (Steps 1 to 3) */}
          {step < 4 && (
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-teal-700/60">
              <span className={`h-1.5 rounded-full flex-1 transition-all ${step >= 1 ? 'bg-teal-400' : 'bg-teal-700'}`} />
              <span className={`h-1.5 rounded-full flex-1 transition-all ${step >= 2 ? 'bg-teal-400' : 'bg-teal-700'}`} />
              <span className={`h-1.5 rounded-full flex-1 transition-all ${step >= 3 ? 'bg-teal-400' : 'bg-teal-700'}`} />
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6">
          {errorMessage && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <strong className="block font-semibold">Atenção na marcação</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* STEP 1: Choose Service & Doctor */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Escolha o Serviço / Exame
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                  {clinic.services.map((cs) => (
                    <button
                      key={cs.id}
                      type="button"
                      onClick={() => setSelectedServiceId(cs.service_id)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        selectedServiceId === cs.service_id
                          ? 'border-teal-600 bg-teal-50/80 ring-2 ring-teal-600/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Stethoscope className={`w-4 h-4 ${selectedServiceId === cs.service_id ? 'text-teal-700' : 'text-slate-400'}`} />
                        <div>
                          <span className="text-sm font-bold text-slate-800 block">
                            {cs.service?.name || 'Serviço'}
                          </span>
                          <span className="text-xs text-slate-500">
                            {cs.specialty?.name || 'Geral'}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-teal-800 font-['Outfit',sans-serif]">
                        {formatPriceAOA(cs.price)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  2. Médico Especialista (Opcional)
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-teal-500"
                >
                  <option value="">Qualquer médico disponível</option>
                  {clinic.doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.full_name} ({doc.specialty?.name || 'Especialista'})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!selectedServiceId) {
                    setErrorMessage('Selecione um serviço para continuar');
                    return;
                  }
                  setErrorMessage(null);
                  setStep(2);
                }}
                className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Avançar para Escolha de Horário</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Choose Date & Available Slot */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Selecione a Data
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {dateOptions.map((opt) => (
                    <button
                      key={opt.iso}
                      type="button"
                      onClick={() => {
                        setSelectedDate(opt.iso);
                        setSelectedSlotId(null);
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        selectedDate === opt.iso
                          ? 'border-teal-600 bg-teal-600 text-white shadow-md'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="block text-[10px] font-bold uppercase">{opt.dayName}</span>
                      <span className="block text-xs font-extrabold mt-0.5">{opt.formatted}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Horários Disponíveis (Vagas Abertas)
                </label>
                {dateSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                    {dateSlots.map((slot) => {
                      const timeStr = new Date(slot.starts_at).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });
                      const isSelected = selectedSlotId === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={`p-3 rounded-xl border font-bold text-sm text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-teal-600 text-white border-teal-600 shadow-md ring-2 ring-teal-600/30'
                              : 'bg-white text-slate-800 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5 mx-auto mb-1 opacity-70" />
                          {timeStr}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-semibold">
                      Não existem horários livres nesta data.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Por favor selecione outro dia no calendário acima.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  disabled={!selectedSlotId}
                  onClick={() => {
                    if (!selectedSlotId) {
                      setErrorMessage('Escolha um horário para avançar');
                      return;
                    }
                    setErrorMessage(null);
                    setStep(3);
                  }}
                  className="flex-1 bg-teal-600 disabled:opacity-50 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Identificação do Paciente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Patient Info & Final Confirmation */}
          {step === 3 && (
            <form onSubmit={handleConfirmBooking} className="space-y-4">
              <div className="bg-teal-50/70 border border-teal-100 rounded-xl p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Serviço:</span>
                  <strong className="text-slate-800">{selectedClinicService?.service?.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Data & Hora:</span>
                  <strong className="text-slate-800">
                    {new Date(selectedDate).toLocaleDateString('pt-AO')} às{' '}
                    {dateSlots.find(s => s.id === selectedSlotId) 
                      ? new Date(dateSlots.find(s => s.id === selectedSlotId)!.starts_at).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </strong>
                </div>
                <div className="flex justify-between border-t border-teal-200/50 pt-1 mt-1">
                  <span className="text-slate-600 font-semibold">Valor a Pagar na Clínica:</span>
                  <strong className="text-teal-800 text-sm font-extrabold">{formatPriceAOA(selectedClinicService?.price)}</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nome Completo do Paciente *
                </label>
                <div className="flex items-center px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-teal-500">
                  <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Ex: Valter Gaspar Fernandes"
                    className="w-full bg-transparent text-sm font-medium text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Número de WhatsApp para Confirmação (+244) *
                </label>
                <div className="flex items-center px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-teal-500">
                  <Phone className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="+244 923 123 456"
                    className="w-full bg-transparent text-sm font-medium text-slate-800 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Enviaremos o comprovativo e lembretes da consulta por WhatsApp para este número.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Observações ou Sintomas (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  placeholder="Ex: Primeira consulta, dores de cabeça frequentes..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <span className="inline-block animate-spin">⏳</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirmar Marcação Segura</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Success & WhatsApp Notification Card */}
          {step === 4 && confirmedAppointment && (
            <div className="text-center py-3 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Reserva Garantida
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-2 font-['Outfit',sans-serif]">
                  Consulta Marcada com Sucesso!
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  A sua vaga foi reservada na <strong>{clinic.name}</strong> e registada no sistema.
                </p>
              </div>

              {/* Receipt Summary Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 font-mono">
                  <span className="text-slate-500 font-sans">Código da Marcação:</span>
                  <span className="font-bold text-teal-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    #{confirmedAppointment.id.slice(-6).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Paciente:</span>
                  <strong className="text-slate-800">{confirmedAppointment.patient_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Serviço:</span>
                  <strong className="text-slate-800">{confirmedAppointment.service?.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Data & Hora:</span>
                  <strong className="text-slate-800">
                    {new Date(confirmedAppointment.slot?.starts_at || '').toLocaleString('pt-AO')}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Local:</span>
                  <strong className="text-slate-800">{clinic.location?.address || clinic.name}</strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold">
                  <span className="text-slate-700">Preço:</span>
                  <span className="text-teal-800">{formatPriceAOA(selectedClinicService?.price)}</span>
                </div>
              </div>

              {/* Primary WhatsApp Action */}
              <div className="space-y-2 pt-1">
                {(() => {
                  const slotDate = new Date(confirmedAppointment.slot?.starts_at || '');
                  const waMsg = buildPatientWhatsAppMessage({
                    toPhone: confirmedAppointment.patient_phone || '',
                    clinicName: clinic.name,
                    patientName: confirmedAppointment.patient_name || '',
                    serviceName: confirmedAppointment.service?.name || '',
                    doctorName: confirmedAppointment.doctor?.full_name,
                    appointmentDate: slotDate.toLocaleDateString('pt-AO'),
                    appointmentTime: slotDate.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
                    clinicAddress: clinic.location?.address || `${clinic.location?.municipality || 'Lubango'}, Huíla`,
                    priceAOA: selectedClinicService?.price || 0
                  }, confirmedAppointment.id);

                  const waLink = generateWhatsAppDirectLink(confirmedAppointment.patient_phone || '+244923120001', waMsg);

                  return (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2 transition-all block text-sm"
                    >
                      <MessageSquare className="w-5 h-5 fill-white" />
                      <span>Abrir Comprovativo no WhatsApp</span>
                    </a>
                  );
                })()}

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 text-xs text-slate-500 font-semibold hover:text-slate-700 transition-colors"
                >
                  Fechar janela e continuar
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
