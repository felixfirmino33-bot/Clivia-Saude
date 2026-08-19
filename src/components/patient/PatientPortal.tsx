import React, { useState } from 'react';
import { Appointment } from '../../types';
import { dataStore } from '../../lib/supabase/client';
import { formatPriceAOA, buildPatientWhatsAppMessage, generateWhatsAppDirectLink } from '../../lib/notifications/whatsapp';
import { Calendar, Clock, MapPin, MessageSquare, Star, CheckCircle, AlertCircle, Send } from 'lucide-react';

interface PatientPortalProps {
  onRefresh: () => void;
  onExploreClinics: () => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({ onRefresh, onExploreClinics }) => {
  const currentUser = dataStore.getCurrentUser();
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    currentUser ? dataStore.getAppointmentsForPatient(currentUser.id) : []
  );

  // Review modal state
  const [reviewingAppId, setReviewingAppId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const handleCancelAppointment = (appId: string) => {
    dataStore.updateAppointmentStatus(appId, 'cancelled');
    if (currentUser) {
      setAppointments(dataStore.getAppointmentsForPatient(currentUser.id));
    }
    onRefresh();
  };

  const handleSubmitReview = (e: React.FormEvent, app: Appointment) => {
    e.preventDefault();

    if (!currentUser) {
      setReviewError('Faça login para avaliar este atendimento.');
      return;
    }

    if (!comment.trim()) {
      setReviewError('Por favor escreva um breve comentário sobre o atendimento.');
      return;
    }

    const res = dataStore.addReview({
      appointmentId: app.id,
      clinicId: app.clinic_id,
      patientId: currentUser.id,
      patientName: app.patient_name || currentUser.full_name || 'Paciente',
      rating,
      comment: comment.trim()
    });

    if (res.success) {
      setReviewSuccess('Obrigado pela sua avaliação! Foi registada com sucesso.');
      setReviewingAppId(null);
      setComment('');
      setTimeout(() => setReviewSuccess(null), 4000);
      onRefresh();
    } else {
      setReviewError(res.error || 'Não foi possível enviar a avaliação.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6" id="clivia-patient-portal">
      
      {/* Patient Header */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="text-xs font-bold text-teal-300 uppercase tracking-wider bg-teal-900/80 px-3 py-1 rounded-full">
            Área Pessoal do Paciente
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit',sans-serif] mt-2">
            Olá, {currentUser?.full_name || 'Paciente'}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/80 mt-1">
            Histórico das suas consultas e comprovativos de marcação no WhatsApp
          </p>
        </div>

        <button
          onClick={onExploreClinics}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-3 rounded-xl transition-colors shrink-0 shadow-lg cursor-pointer"
        >
          Marcar Nova Consulta
        </button>
      </div>

      {reviewSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{reviewSuccess}</span>
        </div>
      )}

      {/* Appointments List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">As Minhas Consultas & Exames</h2>

        {appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((app) => {
              const starts = app.slot ? new Date(app.slot.starts_at) : new Date(app.created_at);
              const isPast = starts < new Date();
              const isCompleted = app.status === 'completed';

              const waMsg = buildPatientWhatsAppMessage({
                toPhone: app.patient_phone || '',
                clinicName: app.clinic?.name || 'Clínica',
                patientName: app.patient_name || currentUser?.full_name || '',
                serviceName: app.service?.name || 'Consulta Médica',
                doctorName: app.doctor?.full_name,
                appointmentDate: starts.toLocaleDateString('pt-AO'),
                appointmentTime: starts.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
                clinicAddress: app.clinic?.location?.address || 'Luanda',
                priceAOA: 20000
              }, app.id);

              const waLink = generateWhatsAppDirectLink(app.patient_phone || '+244923120001', waMsg);

              return (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        #{app.id.slice(-6).toUpperCase()}
                      </span>
                      <strong className="text-base text-slate-900 font-bold">{app.clinic?.name}</strong>
                    </div>

                    <span className={`text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto ${
                      app.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                      app.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      app.status === 'cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {app.status === 'confirmed' ? 'Consulta Confirmada' :
                       app.status === 'completed' ? 'Atendimento Concluído' :
                       app.status === 'cancelled' ? 'Cancelada' : 'Pendente'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400 block font-semibold">Serviço:</span>
                      <strong className="text-slate-800">{app.service?.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Data & Horário:</span>
                      <strong className="text-slate-800">
                        {starts.toLocaleDateString('pt-AO')} às {starts.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Local:</span>
                      <span className="text-slate-700 line-clamp-1">{app.clinic?.location?.address || 'Luanda'}</span>
                    </div>
                  </div>

                  {/* Actions for this appointment */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#1EBE5D] font-bold text-xs px-3 py-1.5 rounded-xl transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Comprovativo WhatsApp</span>
                    </a>

                    <div className="flex items-center gap-2">
                      {isCompleted && !reviewingAppId && (
                        <button
                          onClick={() => setReviewingAppId(app.id)}
                          className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>Avaliar Atendimento</span>
                        </button>
                      )}

                      {app.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancelAppointment(app.id)}
                          className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Cancelar Consulta
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Review Form Drawer */}
                  {reviewingAppId === app.id && (
                    <form onSubmit={(e) => handleSubmitReview(e, app)} className="mt-3 p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900">Como foi o atendimento na {app.clinic?.name}?</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="p-1 focus:outline-none cursor-pointer"
                            >
                              <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea
                        rows={2}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Escreva a sua experiência real (pontualidade, atendimento, instalações)..."
                        className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-400 resize-none"
                      />

                      {reviewError && (
                        <p className="text-xs text-rose-600 font-semibold">{reviewError}</p>
                      )}

                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setReviewingAppId(null)}
                          className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-white rounded-lg"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submeter Avaliação</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-600 font-semibold">Ainda não tem marcações agendadas</p>
            <p className="text-xs text-slate-400 mt-0.5">Pesquise por exames ou consultas e reserve o seu horário em segundos.</p>
            <button
              onClick={onExploreClinics}
              className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
            >
              Pesquisar Clínicas em Luanda
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
