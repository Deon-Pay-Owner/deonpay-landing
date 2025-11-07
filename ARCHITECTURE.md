# DeonPay Landing - Arquitectura

Documentación técnica de la arquitectura del Proyecto A (Landing).

## Visión General

```
┌─────────────────────────────────────────────────────────────┐
│                        deonpay.mx                            │
│                     (Landing - Proyecto A)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Auth Flow
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Supabase Auth                            │
│              (User Management + Sessions)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Shared Cookies
                              │ domain=.deonpay.mx
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  dashboard.deonpay.mx                        │
│                   (Dashboard - Proyecto B)                   │
└─────────────────────────────────────────────────────────────┘
```

## Stack Tecnológico

### Framework y Lenguajes

- **Next.js 15**: React framework con App Router
- **TypeScript**: Type safety y mejor DX
- **React 19**: UI library

### Estilos

- **Tailwind CSS 3.4**: Utility-first CSS
- **PostCSS**: CSS processing
- **Custom utilities**: Clases reutilizables en globals.css

### Autenticación y Base de Datos

- **Supabase Auth**: Managed authentication
- **@supabase/ssr**: Server-side rendering support
- **PostgreSQL**: Base de datos relacional (vía Supabase)

### Validación y Type Safety

- **Zod**: Schema validation
- **TypeScript**: Compile-time type checking

### Deployment

- **Vercel**: Hosting y CI/CD
- **Edge Functions**: Middleware para auth refresh

## Estructura de Directorios

```
apps/landing/
│
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   └── login/
│   │       └── route.ts          # POST /api/login
│   │
│   ├── signin/                   # Sign In Page
│   │   └── page.tsx
│   │
│   ├── signup/                   # Sign Up Page
│   │   └── page.tsx
│   │
│   ├── styles/
│   │   └── globals.css           # Global styles + Tailwind
│   │
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page (/)
│
├── lib/                          # Shared utilities
│   ├── supabase.ts               # Server-side Supabase client
│   └── supabase-client.ts        # Browser Supabase client
│
├── middleware.ts                 # Auth session refresh
│
├── .vscode/                      # VS Code settings
├── .env.example                  # Environment variables template
├── .gitignore
│
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── postcss.config.js             # PostCSS configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json
│
├── README.md                     # Documentación principal
├── QUICKSTART.md                 # Guía de inicio rápido
├── DEPLOYMENT-CHECKLIST.md       # Checklist de deployment
├── ARCHITECTURE.md               # Este archivo
└── supabase-setup.sql            # Script de setup de DB
```

## Flujo de Datos

### 1. Registro de Usuario (Sign Up)

```
User → /signup (Client Component)
  │
  ├─→ User fills form (email, password)
  │
  ├─→ Zod validation (client-side)
  │
  ├─→ supabase.auth.signUp()
  │   │
  │   └─→ Supabase Auth API
  │       │
  │       ├─→ Create user in auth.users
  │       ├─→ Trigger: handle_new_user() [opcional]
  │       │   └─→ Insert into users_profile
  │       │
  │       └─→ Send verification email
  │
  └─→ Show success message
      └─→ User clicks email link
          └─→ Redirect to /signin
```

### 2. Inicio de Sesión (Sign In)

```
User → /signin (Client Component)
  │
  ├─→ User fills form (email, password)
  │
  ├─→ Zod validation (client-side)
  │
  ├─→ POST /api/login (Server API Route)
  │   │
  │   ├─→ Rate limiting check (in-memory)
  │   │
  │   ├─→ supabase.auth.signInWithPassword()
  │   │   └─→ Set cookies (httpOnly, secure, domain=.deonpay.mx)
  │   │
  │   ├─→ Check users_profile.default_merchant_id
  │   │   │
  │   │   ├─→ If exists: use it
  │   │   │
  │   │   └─→ If not exists:
  │   │       ├─→ INSERT into merchants
  │   │       └─→ UPSERT into users_profile
  │   │
  │   └─→ Return { ok: true, redirectTo: "https://dashboard.deonpay.mx/{merchantId}" }
  │
  └─→ Client redirects to dashboard
```

### 3. Middleware (Session Refresh)

```
Every request → middleware.ts
  │
  ├─→ Create Supabase client with cookies
  │
  ├─→ supabase.auth.getUser()
  │   │
  │   ├─→ If session expired:
  │   │   └─→ Refresh tokens automatically
  │   │
  │   └─→ Update cookies with new tokens
  │
  └─→ Continue to requested page
```

## Modelo de Datos

### Esquema de Base de Datos (PostgreSQL)

```sql
┌─────────────────────────┐
│      auth.users         │  (Supabase managed)
│─────────────────────────│
│ id (uuid) PK            │
│ email                   │
│ encrypted_password      │
│ email_confirmed_at      │
│ created_at              │
│ ...                     │
└─────────────────────────┘
           │
           │ 1:1
           ▼
┌─────────────────────────┐
│    users_profile        │
│─────────────────────────│
│ user_id (uuid) PK ─────────┐
│ default_merchant_id FK  │   │
│ created_at              │   │
└─────────────────────────┘   │
           │                  │
           │ 1:N              │
           ▼                  │
┌─────────────────────────┐   │
│      merchants          │   │
│─────────────────────────│   │
│ id (uuid) PK ◄──────────────┘
│ owner_user_id (uuid) FK │
│ name                    │
│ created_at              │
└─────────────────────────┘
```

### Relaciones

- `auth.users` 1:1 `users_profile` (un usuario tiene un perfil)
- `auth.users` 1:N `merchants` (un usuario puede tener múltiples merchants)
- `users_profile` N:1 `merchants` (un perfil apunta a un merchant por defecto)

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con estas políticas:

**merchants**:
- SELECT: `owner_user_id = auth.uid()`
- INSERT: `owner_user_id = auth.uid()`
- UPDATE: `owner_user_id = auth.uid()`
- DELETE: `owner_user_id = auth.uid()`

**users_profile**:
- SELECT: `user_id = auth.uid()`
- INSERT: `user_id = auth.uid()`
- UPDATE: `user_id = auth.uid()`
- DELETE: `user_id = auth.uid()`

## Autenticación y Seguridad

### Cookies

```typescript
{
  name: 'sb-{project-ref}-auth-token',
  httpOnly: true,        // No accesible desde JS
  secure: true,          // Solo HTTPS
  sameSite: 'lax',       // Protección CSRF
  domain: '.deonpay.mx', // Compartida en subdominios
  maxAge: 3600           // 1 hora (renovable)
}
```

### Rate Limiting

Implementación en memoria (desarrollo):

```typescript
const loginAttempts = Map<email, { count, resetAt }>

Per email:
- Max 5 intentos
- Window: 15 minutos
- Reset on success
```

**Producción**: Reemplazar con Redis/Upstash

### Validación de Inputs

Todos los inputs se validan con Zod:

```typescript
// Signin
z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

// Signup
z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword)
```

### Variables de Entorno

```bash
# Públicas (accessible desde cliente)
NEXT_PUBLIC_SUPABASE_URL        # OK exponer
NEXT_PUBLIC_SUPABASE_ANON_KEY   # OK exponer (RLS protege)

# Privadas (solo servidor)
SUPABASE_COOKIE_DOMAIN          # Configuración
```

**IMPORTANTE**: Nunca exponer `SUPABASE_SERVICE_ROLE_KEY`

## Patrones de Diseño

### 1. Server vs Client Components

```typescript
// app/page.tsx (Server Component - Default)
export default function HomePage() {
  return <StaticContent />
}

// app/signin/page.tsx (Client Component - Interactivity)
'use client'
export default function SignInPage() {
  const [email, setEmail] = useState('')
  // ... interactivity
}
```

**Regla**: Usar Server Components por defecto, Client solo cuando:
- Se necesita useState, useEffect
- Se necesitan event handlers
- Se usa browser APIs

### 2. API Route Pattern

```typescript
// app/api/login/route.ts
export async function POST(request: NextRequest) {
  // 1. Validation
  const data = schema.parse(await request.json())

  // 2. Business logic
  const result = await processLogin(data)

  // 3. Response
  return NextResponse.json(result)
}
```

### 3. Supabase Client Pattern

```typescript
// Server (cookies via headers)
import { createClient } from '@/lib/supabase'
const supabase = await createClient() // Async

// Browser (localStorage)
import { createClient } from '@/lib/supabase-client'
const supabase = createClient() // Sync
```

## Performance

### Code Splitting

- Automático por Next.js App Router
- Cada ruta es un chunk separado
- Dynamic imports para componentes pesados

### Asset Optimization

- Imágenes: Next.js Image component (auto WebP)
- Fonts: Next.js Font optimization (Inter)
- CSS: Tailwind purge en producción

### Caching Strategy

```
Static Pages (/, /signin, /signup):
- Cache-Control: public, max-age=0, must-revalidate
- Regenera en cada deploy

API Routes (/api/login):
- No cache
- Siempre fresh

Static Assets:
- Cache-Control: public, max-age=31536000, immutable
```

## Monitoreo y Observabilidad

### Logging

```typescript
// Production logs
console.error('Login error:', error) // Solo errores

// Development
console.log() permitido
```

### Métricas a Monitorear

1. **Auth Metrics**:
   - Signup conversion rate
   - Login success rate
   - Email verification rate

2. **Performance**:
   - Page load times
   - API response times
   - Error rates

3. **Security**:
   - Failed login attempts
   - Rate limit triggers
   - Unusual activity

### Herramientas Recomendadas

- **Vercel Analytics**: Performance y Web Vitals
- **Supabase Logs**: Auth events y DB queries
- **Sentry** (opcional): Error tracking
- **LogRocket** (opcional): Session replay

## Decisiones Técnicas

### ¿Por qué Next.js 15?

- ✅ App Router estable y maduro
- ✅ Server Components reduce JS bundle
- ✅ Built-in optimizaciones (images, fonts)
- ✅ Edge middleware para auth refresh
- ✅ Excelente DX con TypeScript

### ¿Por qué Supabase?

- ✅ Auth managed (no reinventar rueda)
- ✅ PostgreSQL (relacional, escalable)
- ✅ RLS (seguridad a nivel DB)
- ✅ Realtime capabilities (futuro)
- ✅ Excelente documentación

### ¿Por qué Tailwind?

- ✅ Desarrollo rápido
- ✅ Bundle pequeño (purge)
- ✅ Consistencia visual
- ✅ Fácil de extender
- ✅ Mobile-first

### ¿Por qué Cookies en vez de LocalStorage?

- ✅ HttpOnly: Protege contra XSS
- ✅ Secure: Solo HTTPS
- ✅ SameSite: Protege contra CSRF
- ✅ Compartible entre subdominios
- ✅ Renovación automática en servidor

## Limitaciones Conocidas

### 1. Rate Limiting en Memoria

**Problema**: Se resetea en cada deploy/restart

**Solución Futura**: Redis/Upstash

**Workaround**: Aceptable para MVP, Supabase también tiene rate limiting

### 2. Email Deliverability

**Problema**: Supabase usa IP compartidas, puede ir a spam

**Solución**: Configurar SMTP personalizado (SendGrid, Postmark)

### 3. Sin Password Recovery

**Problema**: No hay flujo de "olvidé mi contraseña"

**Solución Futura**: Implementar en siguiente iteración

### 4. Sin 2FA

**Problema**: Solo email/password

**Solución Futura**: Implementar TOTP/SMS

## Roadmap

### Fase 1 (Actual) ✅
- [x] Home page
- [x] Sign up/in
- [x] Email verification
- [x] Auto merchant creation
- [x] Redirect to dashboard

### Fase 2 (Próximo)
- [ ] Password recovery
- [ ] Email change
- [ ] Profile management
- [ ] 2FA (TOTP)

### Fase 3 (Futuro)
- [ ] OAuth (Google, Apple)
- [ ] Magic links
- [ ] Session management
- [ ] Device tracking

## Testing Strategy

### Actual (Manual)
- Flujo completo de signup
- Flujo completo de login
- Rate limiting
- Email verification

### Futuro
- **Unit Tests**: Vitest + Testing Library
- **Integration Tests**: API routes
- **E2E Tests**: Playwright
- **Visual Tests**: Chromatic/Percy

## Contribuyendo

### Convenciones de Código

1. **Naming**:
   - Components: PascalCase (`HomePage`)
   - Functions: camelCase (`createClient`)
   - Files: kebab-case (`supabase-client.ts`)

2. **Estructura**:
   - Max 200 líneas por archivo
   - Separar lógica de presentación
   - Extraer constantes

3. **TypeScript**:
   - No `any` (usar `unknown`)
   - Interfaces para objetos públicos
   - Types para uniones/intersecciones

### Git Workflow

```bash
# Feature branch
git checkout -b feat/feature-name

# Commits (conventional commits)
git commit -m "feat: add password recovery"
git commit -m "fix: rate limiting bug"
git commit -m "docs: update README"

# Push y PR
git push origin feat/feature-name
```

### Code Review Checklist

- [ ] TypeScript sin errores
- [ ] Build exitoso
- [ ] Responsive design
- [ ] Accesibilidad básica
- [ ] No console.logs
- [ ] Documentación actualizada

---

**Versión**: 1.0.0
**Última actualización**: 2025
**Mantenido por**: Equipo DeonPay
