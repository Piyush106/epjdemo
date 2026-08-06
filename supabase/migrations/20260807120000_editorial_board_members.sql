-- Published editorial board (the public /editorial list). Previously the board
-- was a hardcoded array in lib/editorialBoard.ts; this table makes it fully
-- manageable from the admin dashboard (add / edit / reorder / hide / remove, and
-- "publish to board" from an approved application) with no code change or redeploy.
--
-- Board membership is PUBLIC information, so anon may READ visible rows. All
-- writes go through the token-gated admin API using the service role.

create table if not exists public.editorial_board_members (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  credentials           text not null,      -- e.g. "PhD, Mechanical Engineering"
  affiliation           text not null,      -- role, institution, country
  orcid                 text,
  scopus_id             text,
  wos_id                text,               -- Web of Science ResearcherID
  sinta_id              text,
  display_order         integer not null default 0,
  visible               boolean not null default true,
  source_application_id uuid references public.editorial_board_applications(id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists ebm_order_idx on public.editorial_board_members (display_order asc);

drop trigger if exists ebm_set_updated_at on public.editorial_board_members;
create trigger ebm_set_updated_at before update on public.editorial_board_members
  for each row execute function public.set_updated_at();

alter table public.editorial_board_members enable row level security;

-- Public may read VISIBLE members only. Writes: none for anon/authenticated
-- (service role bypasses RLS). Admin dashboard reads all rows via service role.
drop policy if exists "public reads visible board members" on public.editorial_board_members;
create policy "public reads visible board members"
  on public.editorial_board_members for select
  to anon, authenticated
  using (visible = true);

-- Seed the current board (migrated from lib/editorialBoard.ts, ordered by
-- identifier strength). Guarded so it only runs on an empty table.
do $$
begin
  if not exists (select 1 from public.editorial_board_members) then
    insert into public.editorial_board_members (name, credentials, affiliation, orcid, scopus_id, wos_id, sinta_id, display_order, visible) values
    ('Prof. Emad Toma Bane Karash', 'PhD, Mechanical Engineering', 'Professor, Al-Amarah University College, Iraq', '0000-0001-8202-4038', '50661453100', '9759-2019', null, 1, true),
    ('Dr. Megha (Bakshi) Singh', 'PhD, Management', 'Assistant Professor, Balaji Institute of Management and Human Resource Development, Sri Balaji University, Pune, India', '0000-0002-2651-3184', '58209922200', 'MYQ-4444-2025', null, 2, true),
    ('Dr. M. Raju', 'PhD, Computer Science and Engineering', 'Head and Professor, Department of Computer Science and Engineering, Nalla Malla Reddy Engineering College, India', '0009-0007-3444-6376', '58246307000', 'LTE-0241-2024', null, 3, true),
    ('Prof. Dr. Hasan Köten', 'PhD, Mechanical Engineering', 'Head, Department of Mechanical Engineering, Istanbul Medeniyet University, Turkey', '0000-0002-1907-9420', '36157946800', null, null, 4, true),
    ('Dr. Harsh Vardhan Harsh', 'PhD, Mathematics', 'Associate Professor, Parul University, Vadodara, India', '0000-0003-1310-8400', '57105665500', null, null, 5, true),
    ('Dr. Torang Siregar', 'PhD, Mathematics Education', 'Department of Mathematics Education, Faculty of Tarbiyah and Teacher Training (FTIK), State Institute for Islamic Studies (IAIN) Padangsidimpuan, Indonesia', '0009-0006-1416-0461', null, 'ONJ-9824-2025', null, 6, true),
    ('Dr. Ali Kaya (Ali Mohammadiounotikandi)', 'PhD, Artificial Intelligence and Robotics', 'CEO and Director, AI Infinity Ltd Co., United Kingdom', '0000-0001-7727-9511', null, null, null, 7, true),
    ('Dr. Iwegbue Ishioma Nwanapayi', 'PhD, Library Science', 'Lecturer, Department of Library and Information Science, Dennis Osadebay University, Asaba, Delta State, Nigeria', '0000-0001-8633-0788', null, null, null, 8, true),
    ('Dr. Gerald Malabarbas', 'PhD, Education in Educational Management', 'Professor and Research Director, Christ the King College of Calbayog City, Samar, Philippines', '0000-0002-4080-8333', null, null, null, 9, true),
    ('Dr. Mohammad Taghipour', 'PhD, Industrial Engineering', 'Young Researchers and Elites Club, Science and Research Branch, Islamic Azad University, Tehran, Iran', '0000-0003-3720-3795', null, null, null, 10, true),
    ('Dr. Emmanuel Chika Obizue', 'PhD, Banking and Finance', 'Lecturer, Peaceland College of Education, Nigeria', '0009-0002-9119-1668', null, null, null, 11, true),
    ('Assoc. Prof. Dr. Ahmed Hameed Kaleel', 'PhD, Mechanical Engineering', 'H.R. Manager, College of Engineering, Iraq', null, '35118884500', null, null, 12, true),
    ('Prof. Dr. H. Mahfudnurnajamuddin, S.E., M.M., CRA., CRP', 'PhD, Management Science', 'Professor of Finance and Management, Faculty of Economics and Business, Universitas Muslim Indonesia, Indonesia', null, null, null, '6645740', 13, true),
    ('Assist. Prof. Dr. Jabbar Saadoon Daraj', 'PhD, Economics and Management', 'Assistant Professor of Economics, Al-Nahrain University, Baghdad, Iraq', null, null, null, null, 14, true),
    ('Dr. Addi Juma Faki', 'PhD, Monitoring and Evaluation Systems', 'Senior Planning Officer, Zanzibar Planning Commission, Tanzania', null, null, null, null, 15, true),
    ('Dr. Alaba Lawrence Aladejana', 'PhD, Science Education (Physics Option)', 'Senior Lecturer, Bamidele Olumilua University of Education, Science and Technology, Ikere-Ekiti, Ekiti State, Nigeria', null, null, null, null, 16, true),
    ('Dr. Ana Lucia Andrade Carrión', 'PhD, Infantile Psychology and Early Childhood Education', 'Professor, Faculty of Education, Art and Communication, Universidad Nacional de Loja, Ecuador', null, null, null, null, 17, true),
    ('Dr. Chukwuebuka Okwonna', 'PhD, Mechanical Engineering (Industrial Production and Design)', 'Senior Lecturer and Research Coordinator, Department of Mechanical Engineering, Abia State University, Nigeria', null, null, null, null, 18, true),
    ('Dr. Donia Khalfallah', 'PhD, Regional Science and Business Administration', 'Assistant Lecturer, Department of International and Applied Economics, Széchenyi István University, Hungary', null, null, null, null, 19, true),
    ('Dr. Fadele Ayotunde Alaba', 'PhD, Computer Science', 'Lecturer, Department of Computer Science, Federal University of Education, Zaria, Nigeria', null, null, null, null, 20, true),
    ('Dr. Methodius N. Kiarie', 'PhD, Project Planning and Management', 'Senior Project Management Professional, Kenya Power and Lighting Company (KPLC), Kenya', null, null, null, null, 21, true),
    ('Dr. Nhorito Shadreck', 'PhD, Accounting', 'Lecturer, Midlands State University, Zimbabwe', null, null, null, null, 22, true),
    ('Dr. Nwokeocha Ifeanyi Martins', 'PhD, Mass Communication and Media Studies', 'Lecturer, Federal University, Otuoke, Bayelsa State, Nigeria', null, null, null, null, 23, true),
    ('Dr. Ojji M. Chinedu (MAMN, ANIMN)', 'PhD, Business Administration', 'Department of Business Administration, Faculty of Social and Management Sciences, Benson Idahosa University, Nigeria', null, null, null, null, 24, true),
    ('Dr. Sunny Nwakanma', 'PhD, Vocational and Technical Education', 'Senior Lecturer, Department of Technical Education (Electrical/Electronic Option), Ignatius Ajuru University of Education, Port Harcourt, Rivers State, Nigeria', null, null, null, null, 25, true),
    ('Dr. Varadaraj Aravamudhan', 'PhD, Management', 'Professor of Management Studies, Alliance University, India', null, null, null, null, 26, true),
    ('Prof. Dr. Brahim Necib', 'PhD, Aeronautics and Astronautics', 'Professor and Researcher, Mechanical Engineering Department, Faculty of Technological Sciences, University of Mentouri Constantine, Algeria', null, null, null, null, 27, true);
  end if;
end $$;
