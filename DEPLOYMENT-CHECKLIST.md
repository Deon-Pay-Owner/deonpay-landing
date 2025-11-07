# DeonPay Landing - Checklist de Deployment

Usa esta checklist para asegurar un deployment exitoso a producción.

## Pre-Deployment

### Base de Datos (Supabase)

- [ ] Proyecto de Supabase creado en región apropiada
- [ ] Script `supabase-setup.sql` ejecutado completamente
- [ ] Verificado que las tablas existen: `merchants`, `users_profile`
- [ ] Row Level Security (RLS) habilitado en ambas tablas
- [ ] Políticas RLS creadas y funcionando
- [ ] Índices creados correctamente

### Configuración de Supabase Auth

- [ ] Email templates personalizados (opcional pero recomendado):
  - [ ] Confirm signup
  - [ ] Reset password (para futuro)
- [ ] Redirect URLs configuradas:
  - [ ] `https://deonpay.mx/signin` (producción)
  - [ ] `http://localhost:3000/signin` (desarrollo, opcional)
- [ ] Email rate limiting configurado apropiadamente
- [ ] SMTP personalizado configurado (opcional, mejora deliverability)

### Código

- [ ] Build exitoso localmente: `npm run build`
- [ ] Type checking sin errores: `npm run type-check`
- [ ] Todas las dependencias instaladas
- [ ] No hay console.logs sensibles o debugging code
- [ ] Variables de entorno documentadas en `.env.example`

## Vercel Setup

### 1. Crear Proyecto en Vercel

- [ ] Cuenta de Vercel creada/accesible
- [ ] Repositorio Git conectado a Vercel
- [ ] Root directory configurado: `apps/landing`
- [ ] Framework preset: Next.js
- [ ] Build command: `npm run build` (default)
- [ ] Output directory: `.next` (default)
- [ ] Install command: `npm install` (default)

### 2. Variables de Entorno

Ir a **Settings > Environment Variables** y añadir:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - Value: `https://tuproyecto.supabase.co`
  - Environments: Production, Preview, Development

- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Value: `eyJ...` (tu anon key)
  - Environments: Production, Preview, Development

- [ ] `SUPABASE_COOKIE_DOMAIN`
  - Value: `.deonpay.mx`
  - Environments: Production, Preview
  - Development: `.deonpay.local`

- [ ] `NEXT_PUBLIC_DASHBOARD_URL`
  - Value: `https://dashboard.deonpay.mx`
  - Environments: Production, Preview
  - Development: `http://dashboard.deonpay.local:3001`

### 3. Configurar Dominio

- [ ] Dominio `deonpay.mx` adquirido
- [ ] DNS configurado según instrucciones de Vercel:
  - [ ] A record: `@` → IP de Vercel
  - [ ] CNAME: `www` → `cname.vercel-dns.com`
- [ ] Dominio añadido en Vercel: **Settings > Domains**
- [ ] Certificado SSL generado automáticamente
- [ ] Verificar que `https://deonpay.mx` funciona
- [ ] Verificar que `https://www.deonpay.mx` redirige a `https://deonpay.mx`

## First Deployment

### Deploy a Producción

```bash
# Opción 1: Git push (recomendado)
git add .
git commit -m "feat: initial deployment"
git push origin main

# Opción 2: Vercel CLI
npm i -g vercel
vercel --prod
```

- [ ] Deployment iniciado
- [ ] Build completado sin errores
- [ ] Deployment URL generada

### Verificación Post-Deployment

#### Básico

- [ ] Sitio accesible en `https://deonpay.mx`
- [ ] SSL/HTTPS funcionando (candado verde)
- [ ] Home page carga correctamente
- [ ] No hay errores 404 en recursos estáticos
- [ ] Consola del navegador sin errores

#### Funcionalidad

- [ ] Página `/signin` accesible
- [ ] Página `/signup` accesible
- [ ] Formulario de registro funciona
- [ ] Email de verificación se envía
- [ ] Link de verificación funciona
- [ ] Formulario de login funciona
- [ ] Redirección a dashboard funciona (URL correcta generada)

#### Seguridad

- [ ] Cookies tienen flags correctos (inspeccionar en DevTools):
  - [ ] `Secure` ✓
  - [ ] `HttpOnly` ✓
  - [ ] `SameSite=Lax` ✓
  - [ ] `Domain=.deonpay.mx` ✓
- [ ] Rate limiting funciona (intentar 6+ logins incorrectos)
- [ ] No hay service keys expuestas en el código cliente
- [ ] Headers de seguridad apropiados (usar securityheaders.com)

#### Performance

- [ ] Lighthouse score > 90 (Performance)
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.5s
- [ ] Cumulative Layout Shift < 0.1

## Post-Deployment

### Monitoreo

- [ ] Vercel Analytics habilitado (Settings > Analytics)
- [ ] Error tracking configurado (opcional: Sentry)
- [ ] Uptime monitoring configurado (opcional: UptimeRobot)
- [ ] Logs monitoreados en Vercel Dashboard

### Documentación

- [ ] README.md actualizado con URLs de producción
- [ ] Variables de entorno documentadas
- [ ] Proceso de deployment documentado
- [ ] Equipo informado del deployment

### Backup & Recuperación

- [ ] Backup de base de datos Supabase (punto de restauración)
- [ ] Variables de entorno respaldadas en gestor de secrets
- [ ] Rollback plan definido

### Testing en Producción

Crear cuenta de prueba y verificar flujo completo:

1. **Registro**
   - [ ] Ir a https://deonpay.mx
   - [ ] Click "Crear cuenta"
   - [ ] Registrar con email real
   - [ ] Verificar recepción de email
   - [ ] Click en link de verificación
   - [ ] Confirmar mensaje de éxito

2. **Login**
   - [ ] Ir a https://deonpay.mx/signin
   - [ ] Ingresar credenciales
   - [ ] Verificar redirección a dashboard
   - [ ] Verificar que el merchantId en la URL es válido

3. **Cookies Compartidas** (una vez que dashboard esté desplegado)
   - [ ] Login en landing
   - [ ] Ir a dashboard
   - [ ] Verificar que sesión persiste sin re-login

## Troubleshooting Común

### Build Falla en Vercel

**Síntomas**: Build termina con error

**Checklist**:
- [ ] `npm run build` funciona localmente
- [ ] Todas las dependencias en `package.json`
- [ ] No hay imports de archivos que no existen
- [ ] TypeScript errors corregidos

### Environment Variables No Funcionan

**Síntomas**: "undefined" en variables de entorno

**Checklist**:
- [ ] Variables configuradas en Vercel Dashboard
- [ ] Variables en environments correctos (Production/Preview)
- [ ] Redeploy después de añadir variables
- [ ] Variables con prefijo `NEXT_PUBLIC_` para cliente

### Cookies No Se Comparten

**Síntomas**: Login funciona pero no persiste en dashboard

**Checklist**:
- [ ] `SUPABASE_COOKIE_DOMAIN=.deonpay.mx` (con punto)
- [ ] Ambos dominios usan HTTPS
- [ ] Verificar cookies en DevTools
- [ ] Middleware configurado correctamente

### Emails No Se Envían

**Síntomas**: No llega email de verificación

**Checklist**:
- [ ] Verificar spam/junk
- [ ] Verificar rate limits en Supabase
- [ ] Verificar logs en Supabase > Logs > Auth
- [ ] Considerar SMTP personalizado

## Rollback Plan

Si algo sale mal después del deployment:

### Rollback Inmediato (Vercel)

1. Ir a Vercel Dashboard > Deployments
2. Encontrar último deployment estable
3. Click en "..." > "Promote to Production"
4. Confirmar

### Rollback de Base de Datos (Supabase)

1. Ir a Supabase Dashboard > Database > Backups
2. Seleccionar punto de restauración
3. Click "Restore"
4. Confirmar

### Comunicación

- [ ] Informar al equipo del rollback
- [ ] Documentar la causa del problema
- [ ] Crear issue/ticket para resolver
- [ ] Actualizar este checklist si es necesario

## Next Steps

Una vez que el Landing está en producción:

- [ ] Configurar dominio custom para emails (DKIM, SPF, DMARC)
- [ ] Implementar analytics avanzado (Google Analytics, Mixpanel)
- [ ] Configurar A/B testing (opcional)
- [ ] Optimizar SEO (meta tags, sitemap, robots.txt)
- [ ] Implementar CSP (Content Security Policy)
- [ ] Comenzar desarrollo del Dashboard (Proyecto B)

## Sign-off

- [ ] **Tech Lead** aprueba deployment
- [ ] **QA** completa testing
- [ ] **DevOps** verifica infraestructura
- [ ] **Product** verifica funcionalidad

---

**Deployment Date**: ________________

**Deployed By**: ________________

**Version**: ________________

**Notes**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
