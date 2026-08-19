-- ============================================================================
-- CLÍVIA SAÚDE — SEED DATA (LUANDA, ANGOLA)
-- ============================================================================

-- Especialidades
insert into specialties (id, name) values
  ('11111111-1111-1111-1111-111111111101', 'Cardiologia'),
  ('11111111-1111-1111-1111-111111111102', 'Clínica Geral'),
  ('11111111-1111-1111-1111-111111111103', 'Pediatria'),
  ('11111111-1111-1111-1111-111111111104', 'Ginecologia e Obstetrícia'),
  ('11111111-1111-1111-1111-111111111105', 'Dermatologia'),
  ('11111111-1111-1111-1111-111111111106', 'Oftalmologia'),
  ('11111111-1111-1111-1111-111111111107', 'Ortopedia'),
  ('11111111-1111-1111-1111-111111111108', 'Estomatologia (Dentista)'),
  ('11111111-1111-1111-1111-111111111109', 'Neurologia')
on conflict (id) do nothing;

-- Serviços específicos
insert into services (id, specialty_id, name) values
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'ECG (Eletrocardiograma)'),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111101', 'Ecocardiograma Transtorácico'),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111101', 'Consulta de Cardiologia'),
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111102', 'Consulta de Clínica Geral'),
  ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111102', 'Check-up Básico Geral'),
  ('22222222-2222-2222-2222-222222222206', '11111111-1111-1111-1111-111111111103', 'Consulta de Pediatria'),
  ('22222222-2222-2222-2222-222222222207', '11111111-1111-1111-1111-111111111103', 'Vacinação e Desenvolvimento Infantil'),
  ('22222222-2222-2222-2222-222222222208', '11111111-1111-1111-1111-111111111104', 'Consulta de Ginecologia'),
  ('22222222-2222-2222-2222-222222222209', '11111111-1111-1111-1111-111111111104', 'Ecografia Obstétrica / Ginecológica'),
  ('22222222-2222-2222-2222-222222222210', '11111111-1111-1111-1111-111111111105', 'Consulta de Dermatologia'),
  ('22222222-2222-2222-2222-222222222211', '11111111-1111-1111-1111-111111111106', 'Exame de Refração e Acuidade Visual'),
  ('22222222-2222-2222-2222-222222222212', '11111111-1111-1111-1111-111111111107', 'Consulta de Ortopedia e Traumatologia'),
  ('22222222-2222-2222-2222-222222222213', '11111111-1111-1111-1111-111111111108', 'Destartarização e Limpeza Dental'),
  ('22222222-2222-2222-2222-222222222214', '11111111-1111-1111-1111-111111111109', 'Consulta de Neurologia')
on conflict (id) do nothing;

-- Clínicas Reais em Luanda
insert into clinics (id, name, slug, description, status, phone, whatsapp) values
  ('33333333-3333-3333-3333-333333333301', 'Clínica Sagrada Esperança - Maianga', 'sagrada-esperanca-maianga', 'Referência nacional em cuidados de saúde especializados e exames laboratoriais avançados em Luanda.', 'verified', '+244 923 120 001', '+244 923 120 001'),
  ('33333333-3333-3333-3333-333333333302', 'Clínica Girassol - Miramar', 'clinica-girassol-miramar', 'Complexo hospitalar de excelência com bloco de urgência 24h, diagnóstico por imagem e corpo clínico internacional.', 'verified', '+244 924 330 002', '+244 924 330 002'),
  ('33333333-3333-3333-3333-333333333303', 'Luanda Medical Center (LMC) - Ingombota', 'luanda-medical-center', 'Centro médico moderno com tecnologia de ponta, atendimento humanizado e mais de 25 especialidades médicas.', 'verified', '+244 926 777 003', '+244 926 777 003'),
  ('33333333-3333-3333-3333-333333333304', 'Clínica Multiperfil - Morro Bento', 'clinica-multiperfil-morro-bento', 'Excelência médica e cirúrgica com fácil acesso no Morro Bento e ampla infraestrutura de internamento.', 'verified', '+244 931 550 004', '+244 931 550 004'),
  ('33333333-3333-3333-3333-333333333305', 'Centro Médico do Talatona', 'centro-medico-talatona', 'Atendimento de proximidade com consultas rápidas de cardiologia, ginecologia e pediatria no coração de Talatona.', 'verified', '+244 945 889 005', '+244 945 889 005')
on conflict (id) do nothing;

-- Localizações Geográficas (PostGIS)
insert into clinic_locations (clinic_id, address, province, municipality, neighborhood, geog) values
  ('33333333-3333-3333-3333-333333333301', 'Avenida Mortala Mohamed, Ilha / Maianga', 'Luanda', 'Maianga', 'Alvalade', ST_SetSRID(ST_MakePoint(13.2344, -8.8383), 4326)),
  ('33333333-3333-3333-3333-333333333302', 'Avenida Comandante Gika, Miramar', 'Luanda', 'Luanda', 'Miramar', ST_SetSRID(ST_MakePoint(13.2421, -8.8156), 4326)),
  ('33333333-3333-3333-3333-333333333303', 'Rua Amílcar Cabral nº 3, Ingombota', 'Luanda', 'Luanda', 'Ingombota / Mutamba', ST_SetSRID(ST_MakePoint(13.2327, -8.8149), 4326)),
  ('33333333-3333-3333-3333-333333333304', 'Estrada da Samba, Morro Bento', 'Luanda', 'Belas', 'Morro Bento', ST_SetSRID(ST_MakePoint(13.1873, -8.8921), 4326)),
  ('33333333-3333-3333-3333-333333333305', 'Via AL14, Condomínio Dolce Vita, Talatona', 'Luanda', 'Talatona', 'Talatona', ST_SetSRID(ST_MakePoint(13.1764, -8.9189), 4326))
on conflict do nothing;

-- Médicos
insert into doctors (id, clinic_id, full_name, specialty_id) values
  ('44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333301', 'Dr. António Sebastião', '11111111-1111-1111-1111-111111111101'),
  ('44444444-4444-4444-4444-444444444402', '33333333-3333-3333-3333-333333333301', 'Dra. Esperança Neto', '11111111-1111-1111-1111-111111111103'),
  ('44444444-4444-4444-4444-444444444403', '33333333-3333-3333-3333-333333333302', 'Dr. Manuel Capango', '11111111-1111-1111-1111-111111111101'),
  ('44444444-4444-4444-4444-444444444404', '33333333-3333-3333-3333-333333333302', 'Dra. Teresa Muanza', '11111111-1111-1111-1111-111111111104'),
  ('44444444-4444-4444-4444-444444444405', '33333333-3333-3333-3333-333333333303', 'Dr. Carlos Morais', '11111111-1111-1111-1111-111111111102'),
  ('44444444-4444-4444-4444-444444444406', '33333333-3333-3333-3333-333333333303', 'Dra. Paula Quaresma', '11111111-1111-1111-1111-111111111105'),
  ('44444444-4444-4444-4444-444444444407', '33333333-3333-3333-3333-333333333304', 'Dr. Fernando Luvualu', '11111111-1111-1111-1111-111111111107'),
  ('44444444-4444-4444-4444-444444444408', '33333333-3333-3333-3333-333333333305', 'Dra. Nair de Carvalho', '11111111-1111-1111-1111-111111111103')
on conflict (id) do nothing;

-- Preços dos Serviços nas Clínicas (em AOA)
insert into clinic_services (clinic_id, service_id, price) values
  ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', 18000), -- ECG
  ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222202', 45000), -- Ecocardiograma
  ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222203', 25000), -- Consulta Cardiologia
  ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222206', 20000), -- Consulta Pediatria
  ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222201', 22000), -- ECG Girassol
  ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222203', 30000), -- Cardiologia Girassol
  ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222208', 28000), -- Ginecologia
  ('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222204', 15000), -- Clínica Geral LMC
  ('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222205', 35000), -- Check-up
  ('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222210', 25000), -- Dermatologia
  ('33333333-3333-3333-3333-333333333304', '22222222-2222-2222-2222-222222222212', 26000), -- Ortopedia
  ('33333333-3333-3333-3333-333333333305', '22222222-2222-2222-2222-222222222206', 18000)  -- Pediatria Talatona
on conflict do nothing;
