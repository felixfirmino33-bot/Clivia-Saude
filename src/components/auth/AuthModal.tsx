import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Building2, 
  Shield, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { UserRole } from '../../types/database';
import { dataStore } from '../../lib/supabase/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  initialRole?: UserRole;
  onAuthSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  initialRole = 'patient',
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+244 ');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync mode and role when props change
  useEffect(() => {
    setMode(initialMode);
    setRole(initialRole);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [initialMode, initialRole, isOpen]);

  // Handle Escape Key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (mode === 'login') {
      const res = await dataStore.login(email, password);
      if (res.success) {
        setSuccessMessage('Sessão iniciada com sucesso!');
        setTimeout(() => {
          onAuthSuccess();
          onClose();
        }, 400);
      } else {
        setErrorMessage(res.error || 'Credenciais inválidas.');
      }
    } else {
      if (!fullName.trim()) {
        setErrorMessage(role === 'clinic_admin' ? 'Por favor informe o nome da clínica.' : 'Por favor informe o seu nome completo.');
        setLoading(false);
        return;
      }
      const res = await dataStore.signup({
        email,
        password,
        full_name: fullName,
        phone,
        role
      });
      if (res.success) {
        setSuccessMessage('Conta e perfil registados com sucesso!');
        setTimeout(() => {
          onAuthSuccess();
          onClose();
        }, 500);
      } else {
        setErrorMessage(res.error || 'Erro ao criar conta.');
      }
    }
    setLoading(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto"
      id="clivia-auth-modal"
      onClick={(e) => {
        // Close when clicking on backdrop outside modal container
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col max-h-[92vh] my-auto animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-slate-900 to-teal-950 p-5 sm:p-6 text-white relative shrink-0">
          
          {/* Big, accessible Close Button */}
          <button 
            type="button"
            onClick={onClose}
            aria-label="Fechar janela"
            className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer border border-white/20 shadow-xs"
          >
            <span>Fechar</span>
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🩺</span>
            <span className="font-extrabold text-xs tracking-wider uppercase text-teal-400">Clívia Saúde · Huíla</span>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold font-['Outfit',sans-serif]">
            {mode === 'login' ? 'Aceder à sua Conta' : 'Criar Nova Conta'}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-[280px]">
            {mode === 'login' 
              ? 'Consulte clínicas e faça a gestão de marcações no Lubango'
              : 'Selecione o seu perfil para começar'}
          </p>

          {/* Mode Switch Tabs */}
          <div className="flex bg-slate-800/80 p-1 rounded-xl mt-4 border border-slate-700">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login' 
                  ? 'bg-teal-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMessage(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'register' 
                  ? 'bg-teal-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Criar Conta
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Role Selection when Registering */}
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                  Tipo de Conta
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('patient')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      role === 'patient'
                        ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <User className="w-4 h-4 mx-auto mb-1 text-teal-600" />
                    <span className="text-[11px] font-bold block">Paciente</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('clinic_admin')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      role === 'clinic_admin'
                        ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Building2 className="w-4 h-4 mx-auto mb-1 text-teal-600" />
                    <span className="text-[11px] font-bold block">Clínica</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      role === 'admin'
                        ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Shield className="w-4 h-4 mx-auto mb-1 text-teal-600" />
                    <span className="text-[11px] font-bold block">Admin</span>
                  </button>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                  {role === 'clinic_admin' ? 'Nome Oficial da Clínica' : 'Nome Completo'} *
                </label>
                <div className="relative">
                  {role === 'clinic_admin' ? (
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  ) : (
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  )}
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={role === 'clinic_admin' ? 'Ex: Policlínica Central do Lubango' : 'Ex: Mateus Gaspar'}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-semibold text-slate-900"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                  Telefone / WhatsApp (Angola)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+244 923 000 000"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-semibold text-slate-900"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                Endereço de E-mail *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@cliviasaude.ao"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-semibold text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                Palavra-passe *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-semibold text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
            >
              {loading ? (
                <span>A processar...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Entrar no Sistema' : 'Registar Conta e Perfil'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Cancel Button */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer py-1"
            >
              Cancelar e voltar à página inicial
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
