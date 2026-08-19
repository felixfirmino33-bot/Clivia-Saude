-- ============================================================================
-- CLÍVIA SAÚDE — MIGRAÇÃO INICIAL (POSTGRESQL + SUPABASE + POSTGIS)
-- ============================================================================

-- Habilitar extensão PostGIS para geolocalização e cálculos espaciais
create extension if not exists postgis;

-- 1. Utilizadores e perfis
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('patient','clinic_admin','staff','admin')),
  full_name text,
  phone text,
  created_at timestamptz default now()
);

-- 2. Clínicas
create table if not exists clinics (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete set null,
  name text not null,
  slug text unique not null,
  description text,
  status text not null default 'pending'
    check (status in ('pending','verified','rejected','suspended')),
  phone text,
  whatsapp text,
  created_at timestamptz default now()
);

-- 3. Localizações das Clínicas com PostGIS
create table if not exists clinic_locations (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id) on delete cascade,
  address text,
  province text default 'Luanda',
  municipality text,
  neighborhood text,
  geog geography(Point, 4326) not null
);

create index if not exists clinic_locations_geog_idx on clinic_locations using gist (geog);

-- 4. Galeria de Imagens da Clínica
create table if not exists clinic_images (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id) on delete cascade,
  url text not null,
  is_cover boolean default false
);

-- 5. Especialidades e Serviços
create table if not exists specialties (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  specialty_id uuid references specialties(id) on delete set null,
  name text not null -- ex.: "ECG", "Ecocardiograma", "Consulta Geral"
);

-- 6. Associação Clínica <-> Serviços e Tabela de Preços (AOA)
create table if not exists clinic_services (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id) on delete cascade,
  service_id uuid references services(id) on delete cascade,
  price numeric,
  currency text default 'AOA'
);

-- 7. Médicos
create table if not exists doctors (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id) on delete cascade,
  full_name text not null,
  specialty_id uuid references specialties(id) on delete set null
);

-- 8. Agenda e Disponibilidade (doctor_slots)
create table if not exists doctor_slots (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid references doctors(id) on delete cascade,
  clinic_id uuid references clinics(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'open'
    check (status in ('open','held','booked','cancelled')),
  -- Impedir sobreposição / duplicidade de slot para o mesmo médico
  unique (doctor_id, starts_at)
);

-- 9. Marcações (appointments)
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references profiles(id) on delete set null,
  clinic_id uuid references clinics(id) on delete cascade,
  doctor_id uuid references doctors(id) on delete set null,
  service_id uuid references services(id) on delete set null,
  slot_id uuid references doctor_slots(id) unique, -- garante estritamente 1 marcação por slot
  status text not null default 'pending'
    check (status in ('pending','confirmed','cancelled','completed','no_show')),
  patient_name text,
  patient_phone text,
  notes text,
  created_at timestamptz default now()
);

-- 10. Avaliações (reviews)
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references appointments(id) on delete cascade,
  patient_id uuid references profiles(id) on delete cascade,
  clinic_id uuid references clinics(id) on delete cascade,
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS POLICIES)
-- ============================================================================

alter table profiles enable row level security;
alter table clinics enable row level security;
alter table clinic_locations enable row level security;
alter table clinic_images enable row level security;
alter table specialties enable row level security;
alter table services enable row level security;
alter table clinic_services enable row level security;
alter table doctors enable row level security;
alter table doctor_slots enable row level security;
alter table appointments enable row level security;
alter table reviews enable row level security;

-- Profiles: cada um vê/edita o seu; Admin vê todos
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id or (select role from profiles where id = auth.uid()) = 'admin');

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Clinics: Leitura pública de clínicas 'verified'; Admin vê todas; Owner vê a sua
create policy "Public can view verified clinics" on clinics
  for select using (status = 'verified' or owner_id = auth.uid() or (select role from profiles where id = auth.uid()) = 'admin');

create policy "Owners and Admins can update clinic" on clinics
  for update using (owner_id = auth.uid() or (select role from profiles where id = auth.uid()) = 'admin');

create policy "Owners and Admins can insert clinic" on clinics
  for insert with check (owner_id = auth.uid() or (select role from profiles where id = auth.uid()) = 'admin');

-- Clinic Locations & Images: Leitura pública
create policy "Public can view clinic locations" on clinic_locations for select using (true);
create policy "Public can view clinic images" on clinic_images for select using (true);

-- Specialties & Services: Leitura pública para busca
create policy "Public can view specialties" on specialties for select using (true);
create policy "Public can view services" on services for select using (true);
create policy "Public can view clinic_services" on clinic_services for select using (true);
create policy "Public can view doctors" on doctors for select using (true);

-- Doctor Slots: Leitura pública de slots 'open'; staff da clínica e admin podem gerir
create policy "Public can view open slots" on doctor_slots
  for select using (status = 'open' or clinic_id in (select id from clinics where owner_id = auth.uid()));

create policy "Clinic staff can manage slots" on doctor_slots
  for all using (clinic_id in (select id from clinics where owner_id = auth.uid()) or (select role from profiles where id = auth.uid()) = 'admin');

-- Appointments: Paciente vê as suas, Clínica vê as suas, Admin vê tudo
create policy "Patients can view own appointments" on appointments
  for select using (patient_id = auth.uid());

create policy "Clinics can view their own appointments" on appointments
  for select using (clinic_id in (select id from clinics where owner_id = auth.uid()));

create policy "Admins can view all appointments" on appointments
  for select using ((select role from profiles where id = auth.uid()) = 'admin');

-- Reviews: Apenas após consulta completed
create policy "Public can read reviews" on reviews for select using (true);

create policy "Patients can create review for completed appointment" on reviews
  for insert with check (
    patient_id = auth.uid() and
    exists (
      select 1 from appointments
      where id = reviews.appointment_id
        and patient_id = auth.uid()
        and status = 'completed'
    )
  );

-- ============================================================================
-- FUNÇÃO ATÓMICA DE MARCAÇÃO (BOOK_SLOT RPC) — PREVENÇÃO DE DUPLA RESERVA
-- ============================================================================

create or replace function book_slot(
  p_slot_id uuid,
  p_patient_id uuid,
  p_service_id uuid,
  p_patient_name text,
  p_patient_phone text,
  p_notes text default null
)
returns json
language plpgsql
security definer
as $$
declare
  v_slot record;
  v_appointment_id uuid;
begin
  -- 1. Bloqueia e verifica o slot com FOR UPDATE para evitar concorrência simultânea
  select * into v_slot
  from doctor_slots
  where id = p_slot_id
  for update;

  if not found then
    return json_build_object('success', false, 'error', 'Slot não encontrado');
  end if;

  if v_slot.status != 'open' then
    return json_build_object('success', false, 'error', 'Este horário já não está disponível');
  end if;

  -- 2. Atualiza o status do slot para booked
  update doctor_slots
  set status = 'booked'
  where id = p_slot_id;

  -- 3. Cria a marcação atómica
  insert into appointments (
    patient_id,
    clinic_id,
    doctor_id,
    service_id,
    slot_id,
    status,
    patient_name,
    patient_phone,
    notes
  ) values (
    p_patient_id,
    v_slot.clinic_id,
    v_slot.doctor_id,
    p_service_id,
    p_slot_id,
    'confirmed',
    p_patient_name,
    p_patient_phone,
    p_notes
  )
  returning id into v_appointment_id;

  return json_build_object(
    'success', true,
    'appointment_id', v_appointment_id,
    'slot_id', p_slot_id,
    'message', 'Marcação confirmada com sucesso'
  );
exception
  when unique_violation then
    return json_build_object('success', false, 'error', 'Conflito: Este horário acabou de ser reservado por outro paciente');
  when others then
    return json_build_object('success', false, 'error', SQLERRM);
end;
$$;
