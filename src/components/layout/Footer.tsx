import React from 'react';
import { Logo } from '../brand/Logo';
import { MapPin, Phone, MessageSquare, ShieldCheck, Heart } from 'lucide-react';
import { generateWhatsAppDirectLink } from '../../lib/notifications/whatsapp';

export const Footer: React.FC = () => {
  const supportWaLink = generateWhatsAppDirectLink('+244923120001', 'Olá equipa Clívia Saúde, gostaria de tirar uma dúvida sobre a plataforma.');

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-16" id="clivia-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <Logo size="lg" variant="light" />
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              O marketplace de saúde de Angola que conecta pacientes às melhores clínicas e médicos na Huíla (Lubango). Compare preços em Kwanzas (AOA), consulte agendas em tempo real e receba confirmações imediatas por WhatsApp.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full">
                <ShieldCheck className="w-4 h-4" />
                Clínicas Verificadas na Huíla (Lubango)
              </span>
            </div>
          </div>

          {/* Col 2: Municípios e Bairros na Huíla */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Zonas & Municípios Atendidos</h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-teal-400" /> Lubango (Centro / Comercial)</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-teal-400" /> Lubango (Bairro da Lage)</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-teal-400" /> Nossa Senhora do Monte</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-teal-400" /> Bairro Lucrécia / Mitcha</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-teal-400" /> Humpata, Chibia & Matala</li>
            </ul>
          </div>

          {/* Col 3: Apoio e WhatsApp */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Canal de Apoio</h4>
            <p className="text-xs text-slate-400 mb-3">
              Dúvidas ou suporte para clínicas e pacientes:
            </p>
            <a
              href={supportWaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Suporte via WhatsApp</span>
            </a>
          </div>

        </div>

        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Empresas parceiras</p>
              <p className="mt-1 text-sm text-slate-300">O sistema foi desenvolvido pela Integra e as outras duas são colaboradoras.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:min-w-[520px]">
              <div className="partner-logo-card partner-logo-card--ag">
                <div className="partner-card__mark partner-card__mark--ag" aria-hidden="true">
                  <svg viewBox="0 0 140 140" role="img" aria-label="AE Gadget logo">
                    <path d="M18 84c20-38 52-56 90-52-14 0-32 4-48 18-14 12-24 28-31 42-4 8-8 12-11 14Z" fill="none" stroke="#fff7ed" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M34 86c16-28 36-42 70-44" fill="none" stroke="#fff7ed" strokeWidth="8" strokeLinecap="round" opacity="0.92"/>
                    <circle cx="92" cy="40" r="9" fill="#fff7ed"/>
                    <path d="M108 48c-12 22-23 34-40 42" fill="none" stroke="#fff7ed" strokeWidth="7" strokeLinecap="round" opacity="0.9"/>
                  </svg>
                </div>
                <span>AE GADGET</span>
                <small>Soluções Tecnológicas</small>
              </div>
              <div className="partner-logo-card partner-logo-card--nar">
                <div className="partner-card__mark partner-card__mark--nar" aria-hidden="true">
                  <svg viewBox="0 0 160 140" role="img" aria-label="Narosário logo">
                    <path d="M22 82h70l16-22h32v22H22v-22Z" fill="#fff" opacity="0.12"/>
                    <path d="M28 82h60l18-24h36v20H28v4Z" fill="#f8fafc" opacity="0.14"/>
                    <path d="M50 52c16 0 30 10 34 26H65l-18 24H28l11-22c6-12 15-20 20-28Z" fill="#fbbf24" opacity="0.95"/>
                    <path d="M76 42h20v14H76zm26 0h14v18H102zM22 90h90v10H22zm94 0h16v10h-16z" fill="#fff" opacity="0.92"/>
                    <circle cx="104" cy="46" r="24" fill="none" stroke="#fff7ed" strokeWidth="8"/>
                    <path d="M104 26v12M104 58v12M88 46h12M120 46h12M93 31l8 8M115 53l-8 8M115 31l-8 8M93 53l8-8" stroke="#fff7ed" strokeWidth="5" strokeLinecap="round"/>
                    <circle cx="104" cy="46" r="5" fill="#fff7ed"/>
                  </svg>
                </div>
                <span>NAROSÁRIO</span>
                <small>ENTREGAS</small>
              </div>
              <div className="partner-logo-card partner-logo-card--integra">
                <div className="partner-card__mark partner-card__mark--integra" aria-hidden="true">
                  <svg viewBox="0 0 140 140" role="img" aria-label="Integra logo">
                    <rect x="14" y="14" width="42" height="42" rx="10" fill="rgba(255,255,255,0.12)" stroke="#fff" strokeWidth="7"/>
                    <rect x="84" y="14" width="42" height="42" rx="10" fill="rgba(255,255,255,0.12)" stroke="#fff" strokeWidth="7"/>
                    <rect x="14" y="84" width="42" height="42" rx="10" fill="rgba(255,255,255,0.12)" stroke="#fff" strokeWidth="7"/>
                    <rect x="84" y="84" width="42" height="42" rx="10" fill="rgba(255,255,255,0.12)" stroke="#fff" strokeWidth="7"/>
                    <path d="M70 20v100M20 70h100" stroke="#fff" strokeWidth="7" strokeLinecap="round"/>
                    <circle cx="70" cy="70" r="13" fill="#fff"/>
                  </svg>
                </div>
                <span>INTEGRA</span>
                <small>Desenvolvimento</small>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Clívia Saúde. Todos os direitos reservados. Feito para Angola 🇦🇴</p>
          <div className="flex items-center gap-1">
            <span>Encontre a saúde que precisa</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
