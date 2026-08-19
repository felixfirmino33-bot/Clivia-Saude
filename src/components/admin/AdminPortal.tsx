import React, { useState } from 'react';
import { ClinicWithDetails, ClinicStatus } from '../../types';
import { dataStore } from '../../lib/supabase/client';
import { ShieldCheck, ShieldAlert, Check, X, Building2, MapPin, Star, Search, RefreshCw } from 'lucide-react';

interface AdminPortalProps {
  onRefresh: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onRefresh }) => {
  const [clinics, setClinics] = useState<ClinicWithDetails[]>(() => dataStore.getAllClinics());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClinicStatus | 'all'>('all');
  const [dbStatus, setDbStatus] = useState<{
    loading: boolean;
    connected?: boolean;
    projectUrl?: string;
    schemaReady?: boolean;
    message?: string;
    details?: Record<string, any>;
  } | null>(null);

  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const checkSupabaseConnection = async () => {
    setDbStatus({ loading: true });
    try {
      const res = await fetch('/api/supabase/test-all');
      const data = await res.json();
      setDbStatus({
        loading: false,
        connected: data.success && data.allTablesOk,
        projectUrl: data.projectUrl,
        schemaReady: data.allTablesOk,
        message: data.allTablesOk 
          ? 'Todas as 8 tabelas do Supabase, índices e funções RPC estão ativas e sincronizadas!' 
          : 'Algumas tabelas ainda não foram criadas ou retornaram erro.',
        details: data.results
      });
    } catch (e: any) {
      setDbStatus({
        loading: false,
        connected: false,
        message: 'Não foi possível contactar o servidor da API Clívia Saúde.'
      });
    }
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    try {
      const res = await fetch('/api/supabase/seed-database', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSeedResult('Base de dados do Supabase populada com sucesso com clínicas da Huíla (Lubango), especialidades e médicos!');
        checkSupabaseConnection();
      } else {
        setSeedResult(`Erro ao popular: ${data.error}`);
      }
    } catch (e: any) {
      setSeedResult(`Erro na requisição: ${e.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleStatusChange = (clinicId: string, newStatus: ClinicStatus) => {
    dataStore.updateClinicStatus(clinicId, newStatus);
    setClinics([...dataStore.getAllClinics()]);
    onRefresh();
  };

  const filteredClinics = clinics.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6" id="clivia-admin-portal">
      
      {/* Admin Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="text-xs font-bold text-teal-400 uppercase tracking-wider bg-slate-800 px-3 py-1 rounded-full">
            Painel Administrativo
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit',sans-serif] mt-2">
            Moderação de Clínicas em Angola
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Aprovação, verificação de credenciais e gestão do marketplace Clívia Saúde
          </p>
        </div>

        <div className="flex gap-3">
          <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 text-center px-4">
            <span className="text-xs text-slate-400 block uppercase">Verificadas</span>
            <strong className="text-xl font-extrabold text-emerald-400">
              {clinics.filter(c => c.status === 'verified').length}
            </strong>
          </div>
          <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 text-center px-4">
            <span className="text-xs text-slate-400 block uppercase">Total</span>
            <strong className="text-xl font-extrabold text-white">{clinics.length}</strong>
          </div>
        </div>
      </div>

      {/* Database Synchronization Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-xs text-slate-900 font-bold">Base de Dados e Clínicas da Huíla (Lubango)</strong>
                <span className="text-[10px] bg-teal-100 text-teal-900 px-2 py-0.5 rounded-md font-bold">
                  Sincronizado
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Infraestrutura de dados protegida com isolamento seguro e verificação contínua de disponibilidade
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
            >
              <Check className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
              <span>{isSeeding ? 'A atualizar clínicas...' : 'Atualizar Dados de Clínicas'}</span>
            </button>

            <button
              onClick={checkSupabaseConnection}
              disabled={dbStatus?.loading}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${dbStatus?.loading ? 'animate-spin' : ''}`} />
              <span>{dbStatus?.loading ? 'A verificar...' : 'Verificar Integridade'}</span>
            </button>
          </div>
        </div>

        {seedResult && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold">
            {seedResult}
          </div>
        )}

        {dbStatus && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 ${
              dbStatus.connected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              {dbStatus.connected ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>{dbStatus.message}</span>
            </div>

            {dbStatus.details && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {Object.entries(dbStatus.details).map(([tbl, info]: [string, any]) => (
                  <div key={tbl} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-slate-700">{tbl}</span>
                      <span className={`w-2 h-2 rounded-full ${info.ok ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {info.ok ? `${info.count} registos encontrados` : `Erro: ${info.error || 'Não encontrada'}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar clínicas por nome..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['all', 'verified', 'pending', 'suspended'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'Todas' : st === 'verified' ? 'Verificadas' : st === 'pending' ? 'Pendentes' : 'Suspensas'}
            </button>
          ))}
        </div>
      </div>

      {/* Clinics Table / Cards */}
      <div className="space-y-3">
        {filteredClinics.map((clinic) => (
          <div
            key={clinic.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{clinic.name}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    clinic.status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                    clinic.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {clinic.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {clinic.location?.address}
                </p>
                <div className="text-xs text-slate-600 mt-1 flex gap-3">
                  <span>🩺 {clinic.services.length} serviços</span>
                  <span>👨‍⚕️ {clinic.doctors.length} médicos</span>
                  <span>★ {clinic.ratingAverage}</span>
                </div>
              </div>
            </div>

            {/* Moderation Actions */}
            <div className="flex items-center gap-2">
              {clinic.status !== 'verified' && (
                <button
                  onClick={() => handleStatusChange(clinic.id, 'verified')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Aprovar Clínica</span>
                </button>
              )}

              {clinic.status !== 'suspended' && (
                <button
                  onClick={() => handleStatusChange(clinic.id, 'suspended')}
                  className="px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Suspender
                </button>
              )}

              {clinic.status === 'suspended' && (
                <button
                  onClick={() => handleStatusChange(clinic.id, 'pending')}
                  className="px-3 py-2 bg-amber-100 text-amber-900 font-bold text-xs rounded-xl hover:bg-amber-200 transition-colors cursor-pointer"
                >
                  Reabrir Avaliação
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
