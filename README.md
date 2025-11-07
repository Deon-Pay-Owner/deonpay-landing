# DeonPay Landing - Proyecto A

Landing page pública de DeonPay con autenticación integrada y redirección al dashboard.

## Stack Tecnológico

- **Next.js 16** (App Router)
- **Tailwind CSS** para estilos
- **Supabase Auth** con `@supabase/ssr` para autenticación segura
- **Zod** para validación de formularios
- **TypeScript** para type safety

## Características

- Home page pública con CTAs para iniciar sesión y crear cuenta
- Flujo de registro de usuarios con verificación por email
- Flujo de inicio de sesión con rate limiting
- Cookies seguras compartidas en subdominios (`.deonpay.mx`)
- Creación automática de merchant por defecto al iniciar sesión
- Redirección automática al dashboard con merchantId

## Estructura del Proyecto

```
apps/landing/
├── app/
│   ├── api/
│   │   └── login/
│   │       └── route.ts          # API route para autenticación
│   ├── signin/
│   │   └── page.tsx              # Página de inicio de sesión
│   ├── signup/
│   │   └── page.tsx              # Página de registro
│   ├── styles/
│   │   └── globals.css           # Estilos globales
│   ├── layout.tsx                # Layout principal
│   └── page.tsx                  # Home page
├── lib/
│   ├── supabase.ts               # Cliente Supabase SSR (server)
│   └── supabase-client.ts        # Cliente Supabase (browser)
├── middleware.ts                 # Middleware para refresh de sesiones
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
└── package.json
```

## Configuración de Base de Datos (Supabase)

### 1. Crear las tablas necesarias

Ejecuta el siguiente SQL en el SQL Editor de Supabase:

```sql
-- Tabla de merchants (comerciantes)
create table merchants (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

-- Tabla de perfiles de usuario
create table users_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  default_merchant_id uuid references merchants(id) on delete set null,
  created_at timestamptz default now()
);

-- Índices para mejorar el rendimiento
create index idx_merchants_owner on merchants(owner_user_id);
create index idx_users_profile_merchant on users_profile(default_merchant_id);
```

### 2. Configurar Row Level Security (RLS)

```sql
-- Habilitar RLS en ambas tablas
alter table merchants enable row level security;
alter table users_profile enable row level security;

-- Política para merchants: los usuarios solo pueden ver sus propios merchants
create policy "Users can view their own merchants"
  on merchants for select
  using (auth.uid() = owner_user_id);

create policy "Users can insert their own merchants"
  on merchants for insert
  with check (auth.uid() = owner_user_id);

create policy "Users can update their own merchants"
  on merchants for update
  using (auth.uid() = owner_user_id);

-- Política para users_profile: los usuarios solo pueden ver su propio perfil
create policy "Users can view their own profile"
  on users_profile for select
  using (auth.uid() = user_id);

create policy "Users can insert their own profile"
  on users_profile for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on users_profile for update
  using (auth.uid() = user_id);
```

### 3. Configurar Supabase Auth

En el panel de Supabase, ve a **Authentication > Email Templates** y configura:

- **Confirm signup**: Personaliza el template de confirmación de email
- **Redirect URLs**: Añade `https://deonpay.mx/signin` y `http://localhost:3000/signin` (desarrollo)

## Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui

# Cookie domain para compartir sesiones entre subdominios
SUPABASE_COOKIE_DOMAIN=.deonpay.mx

# Dashboard URL
NEXT_PUBLIC_DASHBOARD_URL=https://dashboard.deonpay.mx
```

### Obtener las credenciales de Supabase:

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Settings > API
3. Copia `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
4. Copia `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Instalación

```bash
# Navegar al directorio del proyecto
cd apps/landing

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local
# Luego edita .env.local con tus credenciales reales
```

## Desarrollo Local

```bash
# Modo desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Probar el flujo completo localmente:

Para probar cookies compartidas en subdominios localmente, necesitas configurar hosts virtuales:

1. Edita tu archivo `hosts`:
   - **Windows**: `C:\Windows\System32\drivers\etc\hosts`
   - **Mac/Linux**: `/etc/hosts`

2. Añade estas líneas:
   ```
   127.0.0.1 deonpay.local
   127.0.0.1 dashboard.deonpay.local
   ```

3. Actualiza `.env.local`:
   ```
   SUPABASE_COOKIE_DOMAIN=.deonpay.local
   ```

4. Accede a `http://deonpay.local:3000`

## Build y Start

```bash
# Crear build de producción
npm run build

# Ejecutar build de producción
npm start
```

## Type Checking

```bash
npm run type-check
```

## Flujo de Usuario

### Registro (`/signup`)

1. Usuario completa el formulario con email y password
2. Sistema crea cuenta en Supabase Auth
3. Supabase envía email de verificación
4. Usuario ve mensaje de éxito con instrucciones
5. Usuario hace clic en el link del email para verificar cuenta
6. Usuario puede iniciar sesión

### Inicio de Sesión (`/signin`)

1. Usuario ingresa email y password
2. Frontend envía POST a `/api/login`
3. API valida credenciales con Supabase
4. API verifica si existe `users_profile.default_merchant_id`
5. Si no existe:
   - Crea un nuevo `merchant` con el `user_id`
   - Hace upsert en `users_profile` con el nuevo `merchant_id`
6. API responde con `{ ok: true, redirectTo: "https://dashboard.deonpay.mx/{merchantId}" }`
7. Frontend redirige al dashboard

## Seguridad

### Cookies Seguras

Las cookies se configuran con:
- `httpOnly: true` - No accesibles desde JavaScript
- `secure: true` - Solo se envían por HTTPS
- `sameSite: 'lax'` - Protección CSRF
- `domain: '.deonpay.mx'` - Compartidas en subdominios

### Rate Limiting

El endpoint `/api/login` implementa rate limiting:
- Máximo 5 intentos por email cada 15 minutos
- Contador se resetea en login exitoso
- **Nota**: En producción, usar Redis o similar en lugar de memoria

### Validación de Inputs

Todos los formularios usan Zod para validación:
- Email válido
- Password mínimo 8 caracteres (signup), 6 (signin)
- Confirmación de password coincidente

### Row Level Security (RLS)

- Todas las tablas tienen RLS habilitado
- Los usuarios solo pueden ver y modificar sus propios datos
- Las políticas se aplican automáticamente en todas las queries

## Despliegue en Vercel

### 1. Conectar el Proyecto

```bash
# Instalar Vercel CLI
npm i -g vercel

# Navegar al proyecto
cd apps/landing

# Conectar con Vercel
vercel link
```

### 2. Configurar Variables de Entorno en Vercel

Ve a tu proyecto en Vercel Dashboard:
- Settings > Environment Variables
- Añade todas las variables de `.env.example`
- Asegúrate de usar los valores de producción

### 3. Configurar Dominio

En Vercel Dashboard:
- Settings > Domains
- Añade `deonpay.mx`
- Configura los DNS según las instrucciones de Vercel

### 4. Deploy

```bash
# Deploy a producción
vercel --prod
```

## Testing

### Flujo de Registro

1. Ir a `/signup`
2. Completar formulario
3. Verificar que muestra mensaje de verificación
4. Revisar email
5. Hacer clic en link de verificación
6. Verificar redirección a signin

### Flujo de Login

1. Ir a `/signin`
2. Ingresar credenciales válidas
3. Verificar redirección a `dashboard.deonpay.mx/{merchantId}`
4. Verificar que cookies se comparten (auth funciona en dashboard)

### Rate Limiting

1. Intentar login con credenciales incorrectas 5 veces
2. Verificar mensaje de error en el 6to intento
3. Esperar 15 minutos o limpiar memoria del servidor
4. Verificar que se puede intentar de nuevo

## Troubleshooting

### Error: "Invalid Refresh Token"

- Verifica que el middleware esté configurado correctamente
- Verifica que las cookies tengan el domain correcto
- Limpia cookies del navegador y vuelve a iniciar sesión

### Error: "Failed to fetch" en login

- Verifica que las variables de entorno estén configuradas
- Verifica que Supabase esté accesible
- Revisa la consola del navegador y logs del servidor

### Cookies no se comparten entre subdominios

- Verifica que `SUPABASE_COOKIE_DOMAIN` sea `.deonpay.mx` (con el punto)
- Verifica que ambos subdominios usen HTTPS en producción
- Revisa las cookies en DevTools > Application > Cookies

## Próximos Pasos

1. **Integrar design tokens**: Reemplazar colores hardcodeados con tokens del design system
2. **Añadir analytics**: Implementar tracking de eventos (signup, login, etc.)
3. **Mejorar rate limiting**: Migrar a Redis para producción
4. **Añadir 2FA**: Implementar autenticación de dos factores
5. **Password recovery**: Añadir flujo de recuperación de contraseña
6. **Tests E2E**: Añadir tests con Playwright o Cypress

## Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase SSR Documentation](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zod Documentation](https://zod.dev)

## Soporte

Para problemas o preguntas, contacta al equipo de desarrollo.

---

**DeonPay** - Plataforma de Pagos © 2025
