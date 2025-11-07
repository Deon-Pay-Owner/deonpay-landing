-- ============================================
-- DeonPay Landing - Supabase Database Setup
-- ============================================
-- Ejecuta este archivo completo en el SQL Editor de Supabase
-- Dashboard > SQL Editor > New Query > Pega y ejecuta

-- ============================================
-- 1. CREAR TABLAS
-- ============================================

-- Tabla de merchants (comerciantes)
create table if not exists merchants (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

-- Tabla de perfiles de usuario
create table if not exists users_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  default_merchant_id uuid references merchants(id) on delete set null,
  created_at timestamptz default now()
);

-- ============================================
-- 2. CREAR ÍNDICES
-- ============================================

-- Índice para búsquedas por owner_user_id en merchants
create index if not exists idx_merchants_owner on merchants(owner_user_id);

-- Índice para búsquedas por default_merchant_id en users_profile
create index if not exists idx_users_profile_merchant on users_profile(default_merchant_id);

-- ============================================
-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================

alter table merchants enable row level security;
alter table users_profile enable row level security;

-- ============================================
-- 4. POLÍTICAS RLS PARA MERCHANTS
-- ============================================

-- Política: Los usuarios pueden ver sus propios merchants
create policy "Users can view their own merchants"
  on merchants for select
  using (auth.uid() = owner_user_id);

-- Política: Los usuarios pueden crear merchants para sí mismos
create policy "Users can insert their own merchants"
  on merchants for insert
  with check (auth.uid() = owner_user_id);

-- Política: Los usuarios pueden actualizar sus propios merchants
create policy "Users can update their own merchants"
  on merchants for update
  using (auth.uid() = owner_user_id);

-- Política: Los usuarios pueden eliminar sus propios merchants
create policy "Users can delete their own merchants"
  on merchants for delete
  using (auth.uid() = owner_user_id);

-- ============================================
-- 5. POLÍTICAS RLS PARA USERS_PROFILE
-- ============================================

-- Política: Los usuarios pueden ver su propio perfil
create policy "Users can view their own profile"
  on users_profile for select
  using (auth.uid() = user_id);

-- Política: Los usuarios pueden crear su propio perfil
create policy "Users can insert their own profile"
  on users_profile for insert
  with check (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar su propio perfil
create policy "Users can update their own profile"
  on users_profile for update
  using (auth.uid() = user_id);

-- Política: Los usuarios pueden eliminar su propio perfil
create policy "Users can delete their own profile"
  on users_profile for delete
  using (auth.uid() = user_id);

-- ============================================
-- 6. FUNCIÓN PARA AUTO-CREAR PERFIL (OPCIONAL)
-- ============================================
-- Esta función crea automáticamente un perfil cuando se registra un usuario
-- Puedes omitirla si prefieres crear el perfil manualmente en /api/login

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users_profile (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- Trigger que ejecuta la función cuando se crea un usuario
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecuta estas queries para verificar que todo se creó correctamente

-- Verificar tablas
select table_name
from information_schema.tables
where table_schema = 'public'
and table_name in ('merchants', 'users_profile');

-- Verificar índices
select indexname
from pg_indexes
where schemaname = 'public'
and tablename in ('merchants', 'users_profile');

-- Verificar políticas RLS
select tablename, policyname
from pg_policies
where schemaname = 'public'
and tablename in ('merchants', 'users_profile');

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. Asegúrate de configurar las Redirect URLs en Supabase:
--    Dashboard > Authentication > URL Configuration
--    Añade: https://deonpay.mx/signin (producción)
--           http://localhost:3000/signin (desarrollo)
--
-- 2. Configura el Email Template en:
--    Dashboard > Authentication > Email Templates
--    Personaliza "Confirm signup" según tus necesidades
--
-- 3. Para desarrollo local con subdominios:
--    Edita /etc/hosts (Mac/Linux) o C:\Windows\System32\drivers\etc\hosts (Windows)
--    Añade: 127.0.0.1 deonpay.local
--           127.0.0.1 dashboard.deonpay.local
