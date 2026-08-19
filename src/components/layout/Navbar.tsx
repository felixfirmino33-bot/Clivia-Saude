import React, { useState } from 'react';
import { Logo } from '../brand/Logo';
import { AppView, UserRole } from '../../types';
import { dataStore } from '../../lib/supabase/client';
import { 
  Search, 
  Calendar, 
  ShieldCheck, 
  User, 
  Building, 
  LogIn, 
  LogOut, 
  ChevronDown, 
  UserPlus,
  LayoutDashboard
} from 'lucide-react';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onRefresh: () => void;
  onOpenAuth: (mode?: 'login' | 'register', role?: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onRefresh, onOpenAuth }) => {
  const currentUser = dataStore.getCurrentUser();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleNavigateToUserArea = () => {
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    if (currentUser.role === 'clinic_admin') {
      onNavigate({ type: 'clinic-portal' });
    } else if (currentUser.role === 'admin') {
      onNavigate({ type: 'admin-portal' });
    } else {
      onNavigate({ type: 'patient-portal' });
    }
    setProfileDropdownOpen(false);
  };

  const handleLogout = () => {
    dataStore.logout();
    setProfileDropdownOpen(false);
    onRefresh();
    onNavigate({ type: 'home' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs" id="clivia-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className="focus:outline-none cursor-pointer flex items-center text-left"
          aria-label="Ir para a página inicial"
        >
          <Logo size="md" />
        </button>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentView.type === 'home' || currentView.type === 'search'
                ? 'text-teal-900 bg-teal-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-teal-600" />
            <span>Explorar Clínicas</span>
          </button>

          {currentUser?.role === 'patient' && (
            <button
              onClick={() => onNavigate({ type: 'patient-portal' })}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentView.type === 'patient-portal'
                  ? 'text-teal-900 bg-teal-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>Minhas Consultas</span>
            </button>
          )}

          {currentUser?.role === 'clinic_admin' && (
            <button
              onClick={() => onNavigate({ type: 'clinic-portal' })}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentView.type === 'clinic-portal'
                  ? 'text-teal-900 bg-teal-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-teal-600" />
              <span>Painel da Clínica</span>
            </button>
          )}

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => onNavigate({ type: 'admin-portal' })}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentView.type === 'admin-portal'
                  ? 'text-teal-900 bg-teal-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Administração</span>
            </button>
          )}

          {!currentUser && (
            <button
              onClick={() => onOpenAuth('register', 'clinic_admin')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-teal-900 hover:bg-teal-50/50 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Building className="w-3.5 h-3.5 text-teal-600" />
              <span>Para Clínicas</span>
            </button>
          )}
        </nav>

        {/* Right Side: Auth & User Account Dropdown */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="relative">
              <button 
                onClick={() => setProfileDropdownOpen(prev => !prev)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-xl bg-teal-600 text-white flex items-center justify-center font-extrabold text-xs">
                  {currentUser.full_name?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-[11px] font-bold text-slate-900 leading-none truncate max-w-[130px]">
                    {currentUser.full_name?.split(' ')[0] || 'Utilizador'}
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-teal-700">
                    {currentUser.role === 'patient' ? 'Paciente' : currentUser.role === 'clinic_admin' ? 'Clínica' : 'Administrador'}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Account Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in divide-y divide-slate-100">
                  <div className="px-4 py-2.5">
                    <p className="text-xs font-bold text-slate-900">{currentUser.full_name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email || 'Sem e-mail'}</p>
                    <span className="inline-block mt-1.5 text-[10px] bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded-md border border-teal-200">
                      {currentUser.role === 'patient' ? 'Conta Paciente' : currentUser.role === 'clinic_admin' ? 'Clínica Parceira' : 'Gestão da Plataforma'}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={handleNavigateToUserArea}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-900 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-teal-600" />
                      <span>
                        {currentUser.role === 'patient' && 'Minhas Consultas & Histórico'}
                        {currentUser.role === 'clinic_admin' && 'Gerir Agenda da Clínica'}
                        {currentUser.role === 'admin' && 'Painel de Controlo Global'}
                      </span>
                    </button>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Terminar Sessão</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-500" />
                <span>Entrar</span>
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Criar Conta</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
