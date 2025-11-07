# DeonPay Landing - Inicio Rápido

Esta guía te ayudará a tener el proyecto corriendo en menos de 10 minutos.

## Pre-requisitos

- Node.js 18+ instalado
- Cuenta de Supabase (gratuita)
- Editor de código (VS Code recomendado)

## Paso 1: Instalar Dependencias (1 min)

```bash
cd apps/landing
npm install
```

## Paso 2: Configurar Supabase (3 min)

### 2.1 Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Espera 2 minutos mientras se aprovisiona

### 2.2 Ejecutar SQL Setup

1. En tu proyecto de Supabase, ve a **SQL Editor**
2. Crea una nueva query
3. Copia y pega todo el contenido de `supabase-setup.sql`
4. Ejecuta (botón Run o Ctrl/Cmd + Enter)
5. Verifica que no haya errores

### 2.3 Obtener Credenciales

1. Ve a **Settings > API**
2. Copia los siguientes valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Paso 3: Configurar Variables de Entorno (1 min)

```bash
# Copia el archivo de ejemplo
cp .env.example .env.local

# Edita .env.local con tus credenciales
```

Tu `.env.local` debe verse así:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-super-larga-aqui
SUPABASE_COOKIE_DOMAIN=.deonpay.local  # Para desarrollo local
NEXT_PUBLIC_DASHBOARD_URL=http://dashboard.deonpay.local:3001
```

## Paso 4: Configurar Hosts Locales (2 min)

### Windows

1. Abre el Bloc de notas como **Administrador**
2. Abre el archivo: `C:\Windows\System32\drivers\etc\hosts`
3. Añade al final:

```
127.0.0.1 deonpay.local
127.0.0.1 dashboard.deonpay.local
```

4. Guarda el archivo

### Mac/Linux

```bash
sudo nano /etc/hosts
```

Añade al final:

```
127.0.0.1 deonpay.local
127.0.0.1 dashboard.deonpay.local
```

Guarda con `Ctrl+O`, Enter, `Ctrl+X`

## Paso 5: Iniciar el Servidor (1 min)

```bash
npm run dev
```

Abre tu navegador en: **http://deonpay.local:3000**

## Probar el Flujo Completo

### Test 1: Registro de Usuario

1. Ve a http://deonpay.local:3000
2. Click en "Crear cuenta"
3. Completa el formulario:
   - Email: `test@example.com`
   - Password: `password123`
4. Deberías ver: "¡Cuenta creada exitosamente!"
5. Ve a tu email y haz click en el link de verificación

### Test 2: Inicio de Sesión

1. Ve a http://deonpay.local:3000/signin
2. Ingresa las credenciales:
   - Email: `test@example.com`
   - Password: `password123`
3. Deberías ser redirigido a: `http://dashboard.deonpay.local:3001/{merchantId}`

**Nota**: La redirección fallará si el dashboard no está corriendo, pero esto es esperado en esta fase.

## Verificar en Supabase

### Ver Usuarios Creados

1. Ve a **Authentication > Users**
2. Deberías ver tu usuario de test

### Ver Datos en Tablas

```sql
-- Ver merchants creados
select * from merchants;

-- Ver perfiles de usuario
select * from users_profile;
```

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Ejecutar build
npm start

# Verificar tipos TypeScript
npm run type-check

# Limpiar .next y reinstalar
rm -rf .next node_modules
npm install
```

## Troubleshooting

### Error: "fetch failed" al hacer login

**Causa**: Variables de entorno incorrectas

**Solución**:
1. Verifica que `.env.local` existe
2. Verifica que las credenciales son correctas
3. Reinicia el servidor dev (`Ctrl+C` y `npm run dev`)

### Error: "relation merchants does not exist"

**Causa**: No se ejecutó el SQL setup

**Solución**:
1. Ve a Supabase SQL Editor
2. Ejecuta todo el archivo `supabase-setup.sql`

### No recibo el email de verificación

**Causa**: En desarrollo, Supabase usa rate limiting

**Solución**:
1. Ve a Supabase > Authentication > Users
2. Click en el usuario
3. Verifica manualmente haciendo click en "Verify email"

### La redirección al dashboard falla

**Causa**: El dashboard aún no está implementado

**Solución**:
Esto es esperado. El Proyecto A (Landing) solo maneja la autenticación. El dashboard se implementará en el Proyecto B.

## Siguiente Paso

Una vez que el landing funciona correctamente:

1. Despliega a Vercel (ver README.md, sección Despliegue)
2. Configura el dominio `deonpay.mx`
3. Actualiza las variables de entorno en Vercel
4. Continúa con el Proyecto B (Dashboard)

## Soporte

Si encuentras problemas:

1. Revisa la consola del navegador (F12)
2. Revisa los logs del servidor (terminal donde corre `npm run dev`)
3. Verifica los logs de Supabase (Dashboard > Logs)
4. Consulta el README.md completo para más detalles

---

¡Listo! Tu landing de DeonPay está funcionando 🎉
