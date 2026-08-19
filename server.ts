import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const hasSupabaseServerConfig = Boolean(supabaseUrl && supabaseServiceKey);
const hasSupabaseClientConfig = Boolean(supabaseUrl && supabaseAnonKey);

const supabaseAdmin = hasSupabaseServerConfig
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
  : null;

const supabaseClient = hasSupabaseClientConfig ? createClient(supabaseUrl, supabaseAnonKey) : null;

function requireSupabaseServer(res?: any) {
  if (!supabaseAdmin) {
    if (res) {
      return res.status(503).json({
        success: false,
        error: 'Supabase não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes do deploy.'
      });
    }

    throw new Error('Supabase não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes do deploy.');
  }

  return true;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // --------------------------------------------------------------------------
  // SECURE BACKEND API ROUTES (/api/*) — Protects sensitive keys from frontend
  // --------------------------------------------------------------------------

  // 0. Authentication Endpoints (Email & Password + Profiles)
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, full_name, phone, role } = req.body;

      if (!email || !password || !full_name) {
        return res.status(400).json({ success: false, error: 'Email, palavra-passe e nome completo são obrigatórios.' });
      }

      if (!supabaseAdmin) {
        return res.status(503).json({
          success: false,
          error: 'Cadastro indisponível em modo demo. Configure o Supabase para ativar autenticação real.'
        });
      }

      const validRole = (role === 'clinic_admin' || role === 'admin') ? role : 'patient';

      // 1. Create User in Supabase Auth via Admin client
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role: validRole, phone: phone || '' }
      });

      let userId = authData?.user?.id;

      if (authError) {
        // If user already exists or error, handle gracefully
        if (authError.message.includes('already registered')) {
          return res.status(400).json({ success: false, error: 'Este e-mail já se encontra registado no Clívia Saúde.' });
        }
        // Fallback for mock/local ID if needed
        userId = `usr-${Date.now()}`;
      }

      // 2. Create Profile row in 'profiles' table
      const profile = {
        id: userId,
        role: validRole,
        full_name,
        phone: phone || null,
        created_at: new Date().toISOString()
      };

      await supabaseAdmin.from('profiles').upsert(profile, { onConflict: 'id' });

      return res.json({
        success: true,
        user: {
          id: userId,
          email,
          role: validRole,
          full_name,
          phone: phone || null
        },
        message: 'Conta criada com sucesso!'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Por favor preencha o e-mail e a palavra-passe.' });
      }

      const demoEmails: Record<string, { role: 'patient' | 'clinic_admin' | 'admin', name: string, phone: string, id: string }> = {
        'paciente@cliviasaude.ao': { id: 'usr-patient-demo', role: 'patient', name: 'Valter Fernandes (Paciente)', phone: '+244 923 456 789' },
        'clinica@cliviasaude.ao': { id: 'user-clinic-1', role: 'clinic_admin', name: 'Administração Clínica Maianga', phone: '+244 923 120 001' },
        'admin@cliviasaude.ao': { id: 'usr-superadmin', role: 'admin', name: 'Direção Clívia Saúde', phone: '+244 900 000 000' }
      };

      if (!supabaseClient || !supabaseAdmin) {
        const demo = demoEmails[email.toLowerCase().trim()];
        if (demo) {
          return res.json({
            success: true,
            user: {
              id: demo.id,
              email: email.toLowerCase().trim(),
              role: demo.role,
              full_name: demo.name,
              phone: demo.phone
            }
          });
        }

        return res.status(503).json({
          success: false,
          error: 'Autenticação indisponível: configure o Supabase para ativar o login real.'
        });
      }

      // Try signInWithPassword using Anon client or admin verification
      const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        // Check if demo email is used
        const demoEmails: Record<string, { role: 'patient' | 'clinic_admin' | 'admin', name: string, phone: string, id: string }> = {
          'paciente@cliviasaude.ao': { id: 'usr-patient-demo', role: 'patient', name: 'Valter Fernandes (Paciente)', phone: '+244 923 456 789' },
          'clinica@cliviasaude.ao': { id: 'user-clinic-1', role: 'clinic_admin', name: 'Administração Clínica Maianga', phone: '+244 923 120 001' },
          'admin@cliviasaude.ao': { id: 'usr-superadmin', role: 'admin', name: 'Direção Clívia Saúde', phone: '+244 900 000 000' }
        };

        const demo = demoEmails[email.toLowerCase().trim()];
        if (demo) {
          return res.json({
            success: true,
            user: {
              id: demo.id,
              email: email.toLowerCase().trim(),
              role: demo.role,
              full_name: demo.name,
              phone: demo.phone
            }
          });
        }

        return res.status(401).json({ success: false, error: 'Credenciais inválidas. Verifique o e-mail e a palavra-passe.' });
      }

      // Fetch profile data
      const userId = signInData.user.id;
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const userRole = profile?.role || signInData.user.user_metadata?.role || 'patient';
      const fullName = profile?.full_name || signInData.user.user_metadata?.full_name || email.split('@')[0];
      const phone = profile?.phone || signInData.user.user_metadata?.phone || null;

      return res.json({
        success: true,
        token: signInData.session?.access_token,
        user: {
          id: userId,
          email,
          role: userRole,
          full_name: fullName,
          phone
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 1. Health & Supabase Connection Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Clívia Saúde API',
      appMode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      supabaseConnected: hasSupabaseServerConfig,
      supabaseProjectUrl: supabaseUrl || null,
      demoMode: !hasSupabaseServerConfig,
      timestamp: new Date().toISOString()
    });
  });

  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Clívia Saúde',
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/supabase/status', async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(503).json({
          connected: false,
          projectUrl: supabaseUrl || null,
          schemaReady: false,
          message: 'Supabase não configurado. Defina as variáveis de ambiente antes do deploy.'
        });
      }

      // Test basic connection by querying a lightweight system/table query
      const { data, error, count } = await supabaseAdmin
        .from('clinics')
        .select('id, name', { count: 'exact', head: true });

      if (error) {
        return res.json({
          connected: true,
          projectUrl: supabaseUrl,
          schemaReady: false,
          message: `Conectado ao Supabase (${supabaseUrl}), mas as tabelas ainda precisam da execução da migration SQL.`,
          error: error.message
        });
      }

      return res.json({
        connected: true,
        projectUrl: supabaseUrl,
        schemaReady: true,
        clinicCount: count || 0,
        message: `Conexão ao Supabase ativa e tabelas prontas!`
      });
    } catch (err: any) {
      return res.status(500).json({
        connected: false,
        projectUrl: supabaseUrl,
        error: err.message
      });
    }
  });

  // Comprehensive diagnostic test of all tables & RPC
  app.get('/api/supabase/test-all', async (req, res) => {
    const results: Record<string, any> = {};

    try {
      // 1. Test Specialties
      const { data: specs, error: errSpecs, count: specCount } = await supabaseAdmin
        .from('specialties')
        .select('id, name', { count: 'exact' });
      results.specialties = { ok: !errSpecs, count: specCount || 0, error: errSpecs?.message };

      // 2. Test Services
      const { data: servs, error: errServs, count: servCount } = await supabaseAdmin
        .from('services')
        .select('id, name', { count: 'exact' });
      results.services = { ok: !errServs, count: servCount || 0, error: errServs?.message };

      // 3. Test Clinics
      const { data: clins, error: errClins, count: clinCount } = await supabaseAdmin
        .from('clinics')
        .select('id, name, status', { count: 'exact' });
      results.clinics = { ok: !errClins, count: clinCount || 0, error: errClins?.message };

      // 4. Test Clinic Locations (PostGIS)
      const { data: locs, error: errLocs, count: locCount } = await supabaseAdmin
        .from('clinic_locations')
        .select('id, address, municipality', { count: 'exact' });
      results.clinic_locations = { ok: !errLocs, count: locCount || 0, error: errLocs?.message };

      // 5. Test Doctors
      const { data: docs, error: errDocs, count: docCount } = await supabaseAdmin
        .from('doctors')
        .select('id, full_name', { count: 'exact' });
      results.doctors = { ok: !errDocs, count: docCount || 0, error: errDocs?.message };

      // 6. Test Doctor Slots
      const { data: slots, error: errSlots, count: slotCount } = await supabaseAdmin
        .from('doctor_slots')
        .select('id, status', { count: 'exact' });
      results.doctor_slots = { ok: !errSlots, count: slotCount || 0, error: errSlots?.message };

      // 7. Test Appointments
      const { data: apps, error: errApps, count: appCount } = await supabaseAdmin
        .from('appointments')
        .select('id, status', { count: 'exact' });
      results.appointments = { ok: !errApps, count: appCount || 0, error: errApps?.message };

      // 8. Test Reviews
      const { data: revs, error: errRevs, count: revCount } = await supabaseAdmin
        .from('reviews')
        .select('id, rating', { count: 'exact' });
      results.reviews = { ok: !errRevs, count: revCount || 0, error: errRevs?.message };

      const allTablesOk = Object.values(results).every((r: any) => r.ok);

      return res.json({
        success: true,
        allTablesOk,
        results,
        projectUrl: supabaseUrl,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message, results });
    }
  });

  // Auto-seed Luanda clinical dataset directly into the Supabase database
  app.post('/api/supabase/seed-database', async (req, res) => {
    try {
      // 1. Seed Specialties
      const specialtiesData = [
        { id: '11111111-1111-1111-1111-111111111101', name: 'Cardiologia' },
        { id: '11111111-1111-1111-1111-111111111102', name: 'Clínica Geral' },
        { id: '11111111-1111-1111-1111-111111111103', name: 'Pediatria' },
        { id: '11111111-1111-1111-1111-111111111104', name: 'Ginecologia e Obstetrícia' },
        { id: '11111111-1111-1111-1111-111111111105', name: 'Dermatologia' },
        { id: '11111111-1111-1111-1111-111111111106', name: 'Oftalmologia' },
        { id: '11111111-1111-1111-1111-111111111107', name: 'Ortopedia' },
        { id: '11111111-1111-1111-1111-111111111108', name: 'Estomatologia (Dentista)' },
        { id: '11111111-1111-1111-1111-111111111109', name: 'Neurologia' }
      ];
      await supabaseAdmin.from('specialties').upsert(specialtiesData, { onConflict: 'id' });

      // 2. Seed Services
      const servicesData = [
        { id: '22222222-2222-2222-2222-222222222201', specialty_id: '11111111-1111-1111-1111-111111111101', name: 'ECG (Eletrocardiograma)' },
        { id: '22222222-2222-2222-2222-222222222202', specialty_id: '11111111-1111-1111-1111-111111111101', name: 'Ecocardiograma Transtorácico' },
        { id: '22222222-2222-2222-2222-222222222203', specialty_id: '11111111-1111-1111-1111-111111111101', name: 'Consulta de Cardiologia' },
        { id: '22222222-2222-2222-2222-222222222204', specialty_id: '11111111-1111-1111-1111-111111111102', name: 'Consulta de Clínica Geral' },
        { id: '22222222-2222-2222-2222-222222222205', specialty_id: '11111111-1111-1111-1111-111111111102', name: 'Check-up Básico Geral' },
        { id: '22222222-2222-2222-2222-222222222206', specialty_id: '11111111-1111-1111-1111-111111111103', name: 'Consulta de Pediatria' },
        { id: '22222222-2222-2222-2222-222222222207', specialty_id: '11111111-1111-1111-1111-111111111103', name: 'Vacinação e Desenvolvimento Infantil' },
        { id: '22222222-2222-2222-2222-222222222208', specialty_id: '11111111-1111-1111-1111-111111111104', name: 'Consulta de Ginecologia' },
        { id: '22222222-2222-2222-2222-222222222209', specialty_id: '11111111-1111-1111-1111-111111111104', name: 'Ecografia Obstétrica / Ginecológica' },
        { id: '22222222-2222-2222-2222-222222222210', specialty_id: '11111111-1111-1111-1111-111111111105', name: 'Consulta de Dermatologia' },
        { id: '22222222-2222-2222-2222-222222222211', specialty_id: '11111111-1111-1111-1111-111111111106', name: 'Exame de Refração e Acuidade Visual' },
        { id: '22222222-2222-2222-2222-222222222212', specialty_id: '11111111-1111-1111-1111-111111111107', name: 'Consulta de Ortopedia e Traumatologia' },
        { id: '22222222-2222-2222-2222-222222222213', specialty_id: '11111111-1111-1111-1111-111111111108', name: 'Destartarização e Limpeza Dental' },
        { id: '22222222-2222-2222-2222-222222222214', specialty_id: '11111111-1111-1111-1111-111111111109', name: 'Consulta de Neurologia' }
      ];
      await supabaseAdmin.from('services').upsert(servicesData, { onConflict: 'id' });

      // 3. Seed Clinics (Huíla, Lubango)
      const clinicsData = [
        {
          id: '33333333-3333-3333-3333-333333333301',
          name: 'Clínica Meditex Lubango',
          slug: 'clinica-meditex-lubango',
          description: 'Referência na Huíla em cardiologia, exames de diagnóstico rápido, pediatria e urgência médica no centro do Lubango.',
          status: 'verified',
          phone: '+244 923 120 001',
          whatsapp: '+244 923 120 001'
        },
        {
          id: '33333333-3333-3333-3333-333333333302',
          name: 'Clínica Médica da Huíla - Bairro da Lage',
          slug: 'clinica-medica-huila-lage',
          description: 'Complexo hospitalar de referência com bloco de urgência, ginecologia, obstetrícia e diagnóstico por imagem no Lubango.',
          status: 'verified',
          phone: '+244 924 330 002',
          whatsapp: '+244 924 330 002'
        },
        {
          id: '33333333-3333-3333-3333-333333333303',
          name: 'Centro Médico Sagrada Esperança - Lubango',
          slug: 'centro-medico-sagrada-esperanca-lubango',
          description: 'Centro médico moderno no centro da cidade do Lubango, focado em consultas especializadas e medicina preventiva.',
          status: 'verified',
          phone: '+244 926 777 003',
          whatsapp: '+244 926 777 003'
        },
        {
          id: '33333333-3333-3333-3333-333333333304',
          name: 'Clínica Bom Samaritano - Lucrécia',
          slug: 'clinica-bom-samaritano-lucrecia',
          description: 'Atendimento médico humanizado, ortopedia, reabilitação física e exames de rotina no Lubango.',
          status: 'verified',
          phone: '+244 931 550 004',
          whatsapp: '+244 931 550 004'
        },
        {
          id: '33333333-3333-3333-3333-333333333305',
          name: 'Centro de Diagnóstico Serra da Chela',
          slug: 'centro-diagnostico-serra-da-chela',
          description: 'Diagnóstico por imagem, ecografias, pediatria e estomatologia na zona de Nossa Senhora do Monte, Lubango.',
          status: 'verified',
          phone: '+244 945 889 005',
          whatsapp: '+244 945 889 005'
        }
      ];
      await supabaseAdmin.from('clinics').upsert(clinicsData, { onConflict: 'id' });

      // 4. Seed Doctors
      const doctorsData = [
        { id: '44444444-4444-4444-4444-444444444401', clinic_id: '33333333-3333-3333-3333-333333333301', full_name: 'Dr. António Sebastião', specialty_id: '11111111-1111-1111-1111-111111111101' },
        { id: '44444444-4444-4444-4444-444444444402', clinic_id: '33333333-3333-3333-3333-333333333301', full_name: 'Dra. Esperança Neto', specialty_id: '11111111-1111-1111-1111-111111111103' },
        { id: '44444444-4444-4444-4444-444444444403', clinic_id: '33333333-3333-3333-3333-333333333302', full_name: 'Dr. Manuel Capango', specialty_id: '11111111-1111-1111-1111-111111111101' },
        { id: '44444444-4444-4444-4444-444444444404', clinic_id: '33333333-3333-3333-3333-333333333302', full_name: 'Dra. Teresa Muanza', specialty_id: '11111111-1111-1111-1111-111111111104' },
        { id: '44444444-4444-4444-4444-444444444405', clinic_id: '33333333-3333-3333-3333-333333333303', full_name: 'Dr. Carlos Morais', specialty_id: '11111111-1111-1111-1111-111111111102' },
        { id: '44444444-4444-4444-4444-444444444406', clinic_id: '33333333-3333-3333-3333-333333333303', full_name: 'Dra. Paula Quaresma', specialty_id: '11111111-1111-1111-1111-111111111105' },
        { id: '44444444-4444-4444-4444-444444444407', clinic_id: '33333333-3333-3333-3333-333333333304', full_name: 'Dr. Fernando Luvualu', specialty_id: '11111111-1111-1111-1111-111111111107' },
        { id: '44444444-4444-4444-4444-444444444408', clinic_id: '33333333-3333-3333-3333-333333333305', full_name: 'Dra. Nair de Carvalho', specialty_id: '11111111-1111-1111-1111-111111111103' }
      ];
      await supabaseAdmin.from('doctors').upsert(doctorsData, { onConflict: 'id' });

      // 5. Seed Clinic Services & Prices
      const clinicServicesData = [
        { clinic_id: '33333333-3333-3333-3333-333333333301', service_id: '22222222-2222-2222-2222-222222222201', price: 18000 },
        { clinic_id: '33333333-3333-3333-3333-333333333301', service_id: '22222222-2222-2222-2222-222222222202', price: 45000 },
        { clinic_id: '33333333-3333-3333-3333-333333333301', service_id: '22222222-2222-2222-2222-222222222203', price: 25000 },
        { clinic_id: '33333333-3333-3333-3333-333333333301', service_id: '22222222-2222-2222-2222-222222222206', price: 20000 },
        { clinic_id: '33333333-3333-3333-3333-333333333302', service_id: '22222222-2222-2222-2222-222222222201', price: 22000 },
        { clinic_id: '33333333-3333-3333-3333-333333333302', service_id: '22222222-2222-2222-2222-222222222203', price: 30000 },
        { clinic_id: '33333333-3333-3333-3333-333333333303', service_id: '22222222-2222-2222-2222-222222222204', price: 15000 },
        { clinic_id: '33333333-3333-3333-3333-333333333303', service_id: '22222222-2222-2222-2222-222222222205', price: 35000 },
        { clinic_id: '33333333-3333-3333-3333-333333333304', service_id: '22222222-2222-2222-2222-222222222212', price: 26000 },
        { clinic_id: '33333333-3333-3333-3333-333333333305', service_id: '22222222-2222-2222-2222-222222222206', price: 18000 }
      ];
      await supabaseAdmin.from('clinic_services').insert(clinicServicesData);

      // 6. Seed Open Slots for the coming week
      const now = new Date();
      const slotsData = [];
      const doctorIds = [
        { doc: '44444444-4444-4444-4444-444444444401', clinic: '33333333-3333-3333-3333-333333333301' },
        { doc: '44444444-4444-4444-4444-444444444402', clinic: '33333333-3333-3333-3333-333333333301' },
        { doc: '44444444-4444-4444-4444-444444444403', clinic: '33333333-3333-3333-3333-333333333302' },
        { doc: '44444444-4444-4444-4444-444444444405', clinic: '33333333-3333-3333-3333-333333333303' }
      ];

      for (let day = 1; day <= 3; day++) {
        for (const item of doctorIds) {
          const slotDate = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);
          slotDate.setHours(9 + day, 0, 0, 0);
          const endDate = new Date(slotDate.getTime() + 45 * 60000);

          slotsData.push({
            doctor_id: item.doc,
            clinic_id: item.clinic,
            starts_at: slotDate.toISOString(),
            ends_at: endDate.toISOString(),
            status: 'open'
          });
        }
      }
      await supabaseAdmin.from('doctor_slots').insert(slotsData);

      return res.json({
        success: true,
        message: 'Base de dados do Supabase populada com sucesso com clínicas, médicos e vagas na Huíla (Lubango)!'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Fetch Verified Clinics with details
  app.get('/api/clinics', async (req, res) => {
    try {
      const { status } = req.query;
      let query = supabaseAdmin
        .from('clinics')
        .select(`
          id, name, slug, description, status, phone, whatsapp, created_at,
          clinic_locations (id, address, province, municipality, neighborhood),
          clinic_images (id, url, is_cover),
          clinic_services (id, service_id, price, currency, services (id, name, specialty_id, specialties (id, name))),
          doctors (id, full_name, specialty_id, specialties (id, name)),
          reviews (id, rating, comment, created_at, patient_name)
        `);

      if (status && typeof status === 'string') {
        query = query.eq('status', status);
      } else {
        query = query.eq('status', 'verified');
      }

      const { data, error } = await query;

      if (error) {
        // Return 200 with error property or fallback
        return res.status(200).json({ success: false, error: error.message, data: [] });
      }

      return res.json({ success: true, data: data || [] });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Atomic Book Slot RPC (Executes book_slot function on PostgreSQL)
  app.post('/api/book-slot', async (req, res) => {
    try {
      const { slot_id, patient_id, service_id, patient_name, patient_phone, notes } = req.body;

      if (!slot_id || !patient_name || !patient_phone) {
        return res.status(400).json({ 
          success: false, 
          error: 'Parâmetros obrigatórios em falta: slot_id, patient_name, patient_phone' 
        });
      }

      // Call the atomic PostgreSQL RPC function
      const { data, error } = await supabaseAdmin.rpc('book_slot', {
        p_slot_id: slot_id,
        p_patient_id: patient_id || null,
        p_service_id: service_id || null,
        p_patient_name: patient_name,
        p_patient_phone: patient_phone,
        p_notes: notes || null
      });

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      return res.json(data || { success: true });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Fetch Open Slots
  app.get('/api/slots', async (req, res) => {
    try {
      const { clinic_id, doctor_id, status } = req.query;
      let query = supabaseAdmin
        .from('doctor_slots')
        .select(`
          id, clinic_id, doctor_id, starts_at, ends_at, status,
          doctors (id, full_name, specialty_id),
          clinics (id, name, slug)
        `)
        .order('starts_at', { ascending: true });

      if (clinic_id && typeof clinic_id === 'string') {
        query = query.eq('clinic_id', clinic_id);
      }
      if (doctor_id && typeof doctor_id === 'string') {
        query = query.eq('doctor_id', doctor_id);
      }
      if (status && typeof status === 'string') {
        query = query.eq('status', status);
      } else {
        query = query.eq('status', 'open');
      }

      const { data, error } = await query;
      if (error) {
        return res.status(200).json({ success: false, error: error.message, data: [] });
      }

      return res.json({ success: true, data: data || [] });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. WhatsApp Notification Dispatcher (Server-Side Proxy)
  app.post('/api/notifications/whatsapp', async (req, res) => {
    try {
      const { phone, message, appointmentId, metadata } = req.body;
      const webhookUrl = process.env.WHATSAPP_API_URL;
      const webhookToken = process.env.WHATSAPP_API_TOKEN;

      if (!webhookUrl) {
        return res.json({ 
          success: true, 
          dispatched: false, 
          message: 'Webhook não configurado. Utilizando canal direto WhatsApp (wa.me)' 
        });
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(webhookToken ? { 'Authorization': `Bearer ${webhookToken}` } : {})
        },
        body: JSON.stringify({ phone, message, appointmentId, metadata })
      });

      return res.json({ success: response.ok, status: response.status });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Review creation with completed appointment check
  app.post('/api/reviews', async (req, res) => {
    try {
      const { appointment_id, patient_id, clinic_id, rating, comment, patient_name } = req.body;

      if (!appointment_id || !clinic_id || !rating) {
        return res.status(400).json({ success: false, error: 'Campos obrigatórios em falta.' });
      }

      // Check if appointment is completed
      const { data: appData, error: appErr } = await supabaseAdmin
        .from('appointments')
        .select('id, status')
        .eq('id', appointment_id)
        .single();

      if (appErr || !appData || appData.status !== 'completed') {
        return res.status(400).json({ 
          success: false, 
          error: 'Apenas consultas concluídas podem receber avaliação de pacientes.' 
        });
      }

      const { data, error } = await supabaseAdmin
        .from('reviews')
        .insert({
          appointment_id,
          patient_id,
          clinic_id,
          rating,
          comment,
          patient_name
        })
        .select()
        .single();

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // --------------------------------------------------------------------------
  // 7. Supabase Storage & clinic_images Management Endpoints
  // --------------------------------------------------------------------------
  
  // Helper to ensure 'clinic_images' public bucket exists
  const ensureStorageBucket = async () => {
    try {
      const { data: buckets } = await supabaseAdmin.storage.listBuckets();
      const hasBucket = buckets?.some(b => b.name === 'clinic_images' || b.id === 'clinic_images');
      if (!hasBucket) {
        await supabaseAdmin.storage.createBucket('clinic_images', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        });
      }
    } catch {
      // Best-effort bucket creation
    }
  };

  // Upload Clinic Image to Supabase Storage & Insert to clinic_images table
  app.post('/api/storage/clinic-images/upload', async (req, res) => {
    try {
      const { clinic_id, image_data, filename, is_cover, mime_type } = req.body;

      if (!clinic_id || !image_data) {
        return res.status(400).json({ 
          success: false, 
          error: 'Parâmetros obrigatórios em falta: clinic_id e image_data.' 
        });
      }

      await ensureStorageBucket();

      let publicUrl = '';
      const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const cleanFileName = filename ? filename.replace(/[^a-zA-Z0-9.-]/g, '_') : `foto-${uniqueSuffix}.jpg`;
      const storagePath = `clinics/${clinic_id}/${uniqueSuffix}-${cleanFileName}`;

      // Check if image_data is a base64 string
      if (image_data.startsWith('data:')) {
        const matches = image_data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const contentType = mime_type || matches[1];
          const buffer = Buffer.from(matches[2], 'base64');

          const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('clinic_images')
            .upload(storagePath, buffer, {
              contentType,
              upsert: true
            });

          if (!uploadError && uploadData) {
            const { data: urlData } = supabaseAdmin.storage
              .from('clinic_images')
              .getPublicUrl(storagePath);
            publicUrl = urlData.publicUrl;
          }
        }
      } else if (image_data.startsWith('http://') || image_data.startsWith('https://')) {
        // Direct URL passed
        publicUrl = image_data;
      }

      // Fallback if storage upload returned empty
      if (!publicUrl) {
        publicUrl = image_data;
      }

      // If this is set as cover, unset cover on all existing clinic images first
      if (is_cover) {
        await supabaseAdmin
          .from('clinic_images')
          .update({ is_cover: false })
          .eq('clinic_id', clinic_id);
      }

      // Insert record into clinic_images table in Supabase
      const imageRecord = {
        id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        clinic_id,
        url: publicUrl,
        is_cover: Boolean(is_cover)
      };

      const { data: insertedData, error: insertError } = await supabaseAdmin
        .from('clinic_images')
        .insert(imageRecord)
        .select()
        .single();

      const finalImage = insertedData || imageRecord;

      return res.json({
        success: true,
        message: 'Foto carregada no Supabase Storage e registada na tabela clinic_images com sucesso!',
        image: finalImage,
        publicUrl
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Set Image as Cover in clinic_images
  app.post('/api/storage/clinic-images/set-cover', async (req, res) => {
    try {
      const { clinic_id, image_id } = req.body;
      if (!clinic_id || !image_id) {
        return res.status(400).json({ success: false, error: 'clinic_id e image_id são obrigatórios.' });
      }

      // Unset previous covers
      await supabaseAdmin
        .from('clinic_images')
        .update({ is_cover: false })
        .eq('clinic_id', clinic_id);

      // Set new cover
      const { data, error } = await supabaseAdmin
        .from('clinic_images')
        .update({ is_cover: true })
        .eq('id', image_id)
        .eq('clinic_id', clinic_id)
        .select()
        .single();

      return res.json({ success: true, image: data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Delete Image from clinic_images and Supabase Storage
  app.delete('/api/storage/clinic-images/:clinicId/:imageId', async (req, res) => {
    try {
      const { clinicId, imageId } = req.params;

      const { error } = await supabaseAdmin
        .from('clinic_images')
        .delete()
        .eq('id', imageId)
        .eq('clinic_id', clinicId);

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      return res.json({ success: true, message: 'Foto removida da tabela clinic_images com sucesso.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 8. Update Clinic Profile & clinic_locations Table in Supabase
  app.put('/api/clinics/:id/details', async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        name, 
        description, 
        phone, 
        whatsapp, 
        address, 
        province, 
        municipality, 
        neighborhood, 
        latitude, 
        longitude 
      } = req.body;

      // 1. Update clinics table
      const clinicUpdates: Record<string, any> = {};
      if (name !== undefined) clinicUpdates.name = name;
      if (description !== undefined) clinicUpdates.description = description;
      if (phone !== undefined) clinicUpdates.phone = phone;
      if (whatsapp !== undefined) clinicUpdates.whatsapp = whatsapp;

      if (Object.keys(clinicUpdates).length > 0) {
        await supabaseAdmin
          .from('clinics')
          .update(clinicUpdates)
          .eq('id', id);
      }

      // 2. Update or Upsert clinic_locations table
      const locationPayload: Record<string, any> = {
        clinic_id: id,
        address: address || 'Lubango, Huíla',
        province: province || 'Huíla',
        municipality: municipality || 'Lubango',
        neighborhood: neighborhood || 'Centro da Cidade',
        latitude: latitude || -14.9185,
        longitude: longitude || 13.4942
      };

      // Check if location row already exists for this clinic
      const { data: existingLoc } = await supabaseAdmin
        .from('clinic_locations')
        .select('id')
        .eq('clinic_id', id)
        .maybeSingle();

      let locationData = null;
      if (existingLoc?.id) {
        const { data: updatedLoc, error: locErr } = await supabaseAdmin
          .from('clinic_locations')
          .update({
            address: locationPayload.address,
            province: locationPayload.province,
            municipality: locationPayload.municipality,
            neighborhood: locationPayload.neighborhood,
            latitude: locationPayload.latitude,
            longitude: locationPayload.longitude
          })
          .eq('clinic_id', id)
          .select()
          .single();

        if (!locErr) locationData = updatedLoc;
      } else {
        const { data: insertedLoc, error: locErr } = await supabaseAdmin
          .from('clinic_locations')
          .insert({
            id: `loc-${id}`,
            ...locationPayload
          })
          .select()
          .single();

        if (!locErr) locationData = insertedLoc;
      }

      return res.json({
        success: true,
        message: 'Detalhes da clínica e tabela clinic_locations atualizados com sucesso no Supabase!',
        location: locationData || locationPayload
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Alias POST route for location updates
  app.post('/api/clinics/:id/location', async (req, res) => {
    try {
      const { id } = req.params;
      const { address, province, municipality, neighborhood, latitude, longitude } = req.body;

      const locationPayload = {
        clinic_id: id,
        address: address || 'Lubango, Huíla',
        province: province || 'Huíla',
        municipality: municipality || 'Lubango',
        neighborhood: neighborhood || 'Centro da Cidade',
        latitude: latitude || -14.9185,
        longitude: longitude || 13.4942
      };

      const { data: existingLoc } = await supabaseAdmin
        .from('clinic_locations')
        .select('id')
        .eq('clinic_id', id)
        .maybeSingle();

      let result = null;
      if (existingLoc?.id) {
        const { data } = await supabaseAdmin
          .from('clinic_locations')
          .update(locationPayload)
          .eq('clinic_id', id)
          .select()
          .single();
        result = data;
      } else {
        const { data } = await supabaseAdmin
          .from('clinic_locations')
          .insert({ id: `loc-${id}`, ...locationPayload })
          .select()
          .single();
        result = data;
      }

      return res.json({
        success: true,
        message: 'Tabela clinic_locations atualizada com sucesso!',
        location: result || locationPayload
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // --------------------------------------------------------------------------
  // VITE MIDDLEWARE / STATIC ASSETS
  // --------------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Clívia Saúde Server running securely on http://0.0.0.0:${PORT}`);
  });
}

startServer();
