-- ============================================================
-- Streamo AI — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- Safe to run once on a fresh project. Re-running will error on
-- "already exists" — that's expected, not a bug.
-- ============================================================

-- ---------- 1. PROFILES (extends Supabase Auth users) ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null default 'listener' check (role in ('listener', 'artist', 'staff')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever someone signs up via Supabase Auth.
-- New users default to 'listener'; promote to 'artist' or 'staff' manually
-- (or build an admin action for it later) — never trust a role a client sends.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)), 'listener');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- 2. ARTISTS ----------
create table public.artists (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete set null,
  name text not null,
  bio text default '',
  photo_url text,
  banner_url text,
  verified boolean not null default false,
  followers_count bigint not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- 3. TRACKS ----------
create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references public.artists(id) on delete set null,       -- null for personal listener uploads
  uploaded_by uuid references public.profiles(id) on delete set null,     -- who uploaded it (listener upload case)
  title text not null,
  album text default '',
  genre text default 'lofi',
  ai_tool text,                    -- e.g. "Suno AI Pro" — nullable, optional label
  cover_url text,
  audio_url text not null,
  is_upload boolean not null default false,
  streams_count bigint not null default 0,
  taken_down boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- 4. PLAYLISTS ----------
create table public.playlists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.playlist_tracks (
  playlist_id uuid references public.playlists(id) on delete cascade,
  track_id uuid references public.tracks(id) on delete cascade,
  position int not null default 0,
  added_at timestamptz not null default now(),
  primary key (playlist_id, track_id)
);

-- ---------- 5. LIKES & DOWNLOADS ----------
create table public.likes (
  profile_id uuid references public.profiles(id) on delete cascade,
  track_id uuid references public.tracks(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, track_id)
);

create table public.downloads (
  profile_id uuid references public.profiles(id) on delete cascade,
  track_id uuid references public.tracks(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, track_id)
);

-- ---------- 6. SUBSCRIPTIONS (still simulated payment — see app notes) ----------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  plan text not null check (plan in ('weekly', 'monthly', 'yearly')),
  wallet_method text,               -- 'dana' | 'ovo' | 'gopay' | 'shopeepay' | 'qris'
  status text not null default 'active' check (status in ('active', 'cancelled', 'expired')),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null
);

-- ---------- 7. MODERATION REPORTS ----------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('Hak Cipta', 'Konten', 'Akun')),
  target_track_id uuid references public.tracks(id) on delete cascade,
  target_profile_id uuid references public.profiles(id) on delete cascade,
  note text default '',
  status text not null default 'pending' check (status in ('pending', 'removed', 'dismissed')),
  created_at timestamptz not null default now(),
  resolved_by uuid references public.profiles(id),
  resolved_at timestamptz
);

-- ---------- 8. SUPPORT TICKETS ----------
create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null,
  priority text not null default 'Sedang' check (priority in ('Rendah', 'Sedang', 'Tinggi')),
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.artists enable row level security;
alter table public.tracks enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_tracks enable row level security;
alter table public.likes enable row level security;
alter table public.downloads enable row level security;
alter table public.subscriptions enable row level security;
alter table public.reports enable row level security;
alter table public.support_tickets enable row level security;

-- Small helper: is the current user staff?
create function public.is_staff()
returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'staff'
  );
$$ language sql security definer stable;

-- ---------- profiles ----------
create policy "profiles: read own or staff reads all"
  on public.profiles for select
  using (auth.uid() = id or public.is_staff());

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id);

-- ---------- artists ----------
create policy "artists: public read"
  on public.artists for select using (true);

create policy "artists: owner updates own profile"
  on public.artists for update
  using (profile_id = auth.uid());

create policy "artists: staff can update any (verification)"
  on public.artists for update
  using (public.is_staff());

-- ---------- tracks ----------
create policy "tracks: public read, hide taken-down from non-staff"
  on public.tracks for select
  using (taken_down = false or public.is_staff());

create policy "tracks: artist inserts own tracks"
  on public.tracks for insert
  with check (
    artist_id in (select id from public.artists where profile_id = auth.uid())
    or (is_upload = true and uploaded_by = auth.uid())
  );

create policy "tracks: artist updates own tracks"
  on public.tracks for update
  using (artist_id in (select id from public.artists where profile_id = auth.uid()))
  with check (artist_id in (select id from public.artists where profile_id = auth.uid()));

create policy "tracks: uploader updates/deletes own personal upload"
  on public.tracks for update
  using (is_upload = true and uploaded_by = auth.uid());

create policy "tracks: uploader deletes own personal upload"
  on public.tracks for delete
  using (is_upload = true and uploaded_by = auth.uid());

create policy "tracks: staff can update any (takedown)"
  on public.tracks for update
  using (public.is_staff());

-- ---------- playlists & playlist_tracks (private to owner) ----------
create policy "playlists: owner full access"
  on public.playlists for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "playlist_tracks: owner full access"
  on public.playlist_tracks for all
  using (playlist_id in (select id from public.playlists where owner_id = auth.uid()))
  with check (playlist_id in (select id from public.playlists where owner_id = auth.uid()));

-- ---------- likes & downloads (private to owner) ----------
create policy "likes: owner full access"
  on public.likes for all
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "downloads: owner full access"
  on public.downloads for all
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- ---------- subscriptions ----------
create policy "subscriptions: owner full access"
  on public.subscriptions for all
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- ---------- reports ----------
create policy "reports: any signed-in user can file one"
  on public.reports for insert
  with check (auth.uid() is not null);

create policy "reports: staff reads and updates all"
  on public.reports for select using (public.is_staff());

create policy "reports: staff updates status"
  on public.reports for update using (public.is_staff());

-- ---------- support tickets ----------
create policy "tickets: user reads/creates own"
  on public.support_tickets for select using (user_id = auth.uid() or public.is_staff());

create policy "tickets: user creates own"
  on public.support_tickets for insert with check (user_id = auth.uid());

create policy "tickets: staff updates any"
  on public.support_tickets for update using (public.is_staff());

-- ============================================================
-- STORAGE BUCKETS (run separately if this errors — buckets are
-- sometimes easier to create via Dashboard → Storage → New bucket)
-- ============================================================
insert into storage.buckets (id, name, public) values ('covers', 'covers', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('audio', 'audio', true) on conflict do nothing;

create policy "covers: public read" on storage.objects for select using (bucket_id = 'covers');
create policy "covers: authenticated upload" on storage.objects for insert with check (bucket_id = 'covers' and auth.uid() is not null);
create policy "avatars: public read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars: authenticated upload" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid() is not null);
create policy "audio: public read" on storage.objects for select using (bucket_id = 'audio');
create policy "audio: authenticated upload" on storage.objects for insert with check (bucket_id = 'audio' and auth.uid() is not null);

-- ============================================================
-- SEED DATA (optional) — the same fictional catalog from the demo,
-- so the app isn't empty on first run. Safe to skip or delete.
-- ============================================================
insert into public.artists (name, bio, verified, followers_count) values
  ('Mira Solheim', 'Bikin lo-fi dari kamar tidur sejak 2019.', true, 18400),
  ('The Late Set', 'Trio jazz dari jam session bar tutup lewat tengah malam.', true, 42100),
  ('Nord & Vale', 'Synth dan field recording, direkam di studio dingin di utara.', false, 25700),
  ('Wren Callahan', 'Gitar akustik dan cerita dari meja dapur.', false, 9800),
  ('Pale Weather', 'Ambient buat hari-hari mendung yang panjang.', true, 31200),
  ('Delta June', 'Soul lama yang direkam pakai alat lama juga.', true, 15600);

-- A handful of tracks so /internal/catalog isn't empty on first run.
-- audio_url points at SoundHelix's public instrumental demo files —
-- swap these for real uploads to Supabase Storage later.
insert into public.tracks (artist_id, title, album, genre, ai_tool, streams_count, audio_url) values
  ((select id from public.artists where name = 'Mira Solheim'),  'Amber Static',    'Slow Static',   'lofi',    'Auralis AI Studio Pro', 128400, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
  ((select id from public.artists where name = 'The Late Set'),  'Copper Skyline',  'After Hours',   'jazz',    'NeuraTune Pro',         302900, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'),
  ((select id from public.artists where name = 'Nord & Vale'),   'Quiet Machinery', 'Halflight',     'electro', 'SonicForge Pro',        87650,  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'),
  ((select id from public.artists where name = 'Wren Callahan'), 'Paper Boats',     'Kitchen Table', 'folk',    'VoxWave Pro',           41200,  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'),
  ((select id from public.artists where name = 'Pale Weather'),  'Ossuary Drift',   'No Edges',      'ambient', 'EchoMind AI Pro',       210300, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'),
  ((select id from public.artists where name = 'Delta June'),    'Analog Heart',    'Low Light',     'soul',    'MelodyMind Pro',        156700, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3');

-- A couple of sample reports so /internal/moderation has something to
-- act on immediately. reporter_id is left null (no real reporter yet) —
-- that's fine, the column is nullable on purpose.
insert into public.reports (type, target_track_id, note, status) values
  ('Hak Cipta', (select id from public.tracks where title = 'Amber Static'),   'Diklaim menyalin melodi dari lagu lain.',        'pending'),
  ('Konten',    (select id from public.tracks where title = 'Quiet Machinery'),'Dilaporkan berisi lirik yang menyinggung.',      'pending');

-- Support tickets need a real profile (user_id is not null), so they can't
-- be seeded until at least one real account exists. After you create your
-- first listener account, you can insert a test ticket manually, e.g.:
--
--   insert into public.support_tickets (user_id, subject, priority)
--   values ('<paste-a-real-profile-id-here>', 'Tidak bisa memutar lagu offline', 'Tinggi');

-- ============================================================
-- MIGRATION: lyrics support for the listener app's lyrics panel.
-- Run this block even if you already ran everything above earlier —
-- it only adds a new column and fills in text for the 6 seeded tracks.
-- ============================================================
alter table public.tracks add column if not exists lyrics text[];

update public.tracks set lyrics = array[
  'Dust on the window, gold in the air',
  'Nothing to fix here, nothing to fear',
  'The tape hisses soft where the static blooms',
  'Amber light settles across the room',
  'Hold still a minute, let the hour drift',
  'This is the slowest kind of gift'
] where title = 'Amber Static';

update public.tracks set lyrics = array[
  'Copper rooftops under a low moon',
  'The city hums a half-forgotten tune',
  'Someone''s trumpet leaning on the rail',
  'Every skyline''s got a story to tell',
  'We walk it slow, no need to run',
  'Late nights like this are never quite done'
] where title = 'Copper Skyline';

update public.tracks set lyrics = array[
  'Gears turn quiet behind the wall',
  'A hum so steady it says nothing at all',
  'Wires humming a patient song',
  'Machinery that hums along',
  'Nothing broken, nothing loud',
  'Just quiet motion under a cloud'
] where title = 'Quiet Machinery';

update public.tracks set lyrics = array[
  'Paper boats on the kitchen floor',
  'Folded twice and nothing more',
  'They never sink, they only bend',
  'Small things drifting toward the end',
  'A morning light through an open door',
  'Paper boats on the kitchen floor'
] where title = 'Paper Boats';

update public.tracks set lyrics = array[
  'Bones of the year laid soft in the ground',
  'Nothing left here makes a sound',
  'The wind moves slow through empty rooms',
  'Ash and quiet, dust and bloom',
  'We drift like smoke through halls of stone',
  'Ossuary hush, we''re not alone'
] where title = 'Ossuary Drift';

update public.tracks set lyrics = array[
  'Analog heart, a needle''s hiss',
  'Nothing sounds quite the same as this',
  'Warm little crackle before the song',
  'That''s where the feeling belongs',
  'Turn the light down, let it play',
  'Analog heart, don''t fade away'
] where title = 'Analog Heart';

-- ============================================================
-- MIGRATION: content policy enforcement — Streamo AI only accepts
-- genuinely new music made with a Pro AI tool, never covers. New
-- uploads (from listeners or artists) now require staff review before
-- they're visible to anyone else.
-- ============================================================
alter table public.tracks add column if not exists review_status text not null default 'approved'
  check (review_status in ('pending', 'approved', 'rejected'));
alter table public.tracks add column if not exists review_note text;
alter table public.tracks add column if not exists declared_original boolean not null default true;

-- Existing catalog/seed tracks are already legitimate — mark them approved
-- explicitly so the column's default doesn't silently do the work.
update public.tracks set review_status = 'approved', declared_original = true where review_status is null or review_status = 'approved';

-- Replace the old visibility policy: the public now only sees tracks that
-- are BOTH approved and not taken down. Staff sees everything (to review
-- and moderate). Uploaders and artists can still see their own tracks
-- regardless of status, so their own "Unggahan Saya" / "Musik Saya" pages
-- show pending/rejected items with a status badge instead of nothing.
drop policy if exists "tracks: public read, hide taken-down from non-staff" on public.tracks;
create policy "tracks: read approved+live, own uploads, or staff"
  on public.tracks for select
  using (
    (review_status = 'approved' and taken_down = false)
    or public.is_staff()
    or uploaded_by = auth.uid()
    or artist_id in (select id from public.artists where profile_id = auth.uid())
  );
