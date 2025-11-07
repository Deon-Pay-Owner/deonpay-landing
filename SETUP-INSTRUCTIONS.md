# Instrucciones de Setup - DeonPay Landing

## ✅ Paso 1: Supabase - COMPLETADO

Ya configuré las credenciales en `.env.local`

## 📋 Paso 2: Crear Tablas en Supabase

**IMPORTANTE**: Necesitas hacer esto manualmente (requiere login en tu cuenta de Supabase)

### Instrucciones:

1. Abre tu navegador y ve a: https://supabase.com/dashboard/project/exhjlvaocapbtgvqxnhr

2. En el menú lateral, click en **SQL Editor**

3. Click en **New query**

4. Copia y pega TODO el contenido del archivo `supabase-setup.sql`

5. Click en **Run** (o presiona Ctrl/Cmd + Enter)

6. Verifica que salga: "Success. No rows returned"

7. Para verificar que se crearon las tablas, ve a **Table Editor** en el menú lateral
   - Deberías ver: `merchants` y `users_profile`

### Verificación Rápida (Opcional)

En el SQL Editor, ejecuta:

```sql
-- Verificar tablas
select table_name
from information_schema.tables
where table_schema = 'public'
and table_name in ('merchants', 'users_profile');
```

Deberías ver 2 filas.

---

## 🔑 Paso 3: Credenciales de GitHub

Para conectar a GitHub, necesito que me proporciones una de estas opciones:

### Opción A: Personal Access Token (RECOMENDADO)

1. Ve a: https://github.com/settings/tokens
2. Click en **Generate new token (classic)**
3. Nombre: `DeonPay Deployment`
4. Scopes necesarios:
   - ✅ `repo` (Full control of private repositories)
5. Click en **Generate token**
6. **COPIA EL TOKEN** (solo se muestra una vez)
7. Pégalo aquí en el chat

### Opción B: Repositorio existente

Si ya tienes un repositorio en GitHub:
1. Dame la URL del repositorio (ej: https://github.com/tu-usuario/deonpay)
2. Te diré cómo conectarlo

### Opción C: SSH (si ya tienes SSH configurado)

Si prefieres usar SSH:
1. Dime tu usuario de GitHub
2. Dime el nombre del repositorio que quieres crear

---

## 🚀 Paso 4: Credenciales de Vercel

### Opción A: Vercel Token (Automatizado)

1. Ve a: https://vercel.com/account/tokens
2. Click en **Create Token**
3. Nombre: `DeonPay CLI`
4. Scope: **Full Account**
5. Click en **Create**
6. **COPIA EL TOKEN**
7. Pégalo aquí en el chat

### Opción B: Vercel CLI (Interactivo)

Si prefieres hacerlo interactivamente:
1. Solo dime "usar CLI"
2. Te guiaré paso a paso

---

## 📝 Resumen de lo que necesito:

Por favor, proporcióname en tu próximo mensaje:

```
GITHUB:
- Token: ghp_xxxxxxxxxxxxxxxxxxxxx
O
- URL del repo existente: https://github.com/...
O
- Usuario GitHub: tu-usuario (para crear nuevo repo)

VERCEL:
- Token: vercel_xxxxxxxxxxxxxxxxxxxxx
O
- "usar CLI" (para modo interactivo)
```

---

## ⚡ ¿Qué haré después?

Una vez que me pases las credenciales:

1. ✅ Inicializar Git
2. ✅ Hacer commit de todos los archivos
3. ✅ Crear/conectar repositorio en GitHub
4. ✅ Push a GitHub
5. ✅ Conectar con Vercel
6. ✅ Configurar variables de entorno en Vercel
7. ✅ Deployar automáticamente
8. ✅ Darte la URL de producción

Todo automatizado! 🎉

---

## 🔒 Seguridad

**Nota Importante**: Los tokens que me compartas solo los usaré en esta sesión y NO los guardaré en ningún archivo del proyecto. Son seguros para compartir conmigo en el chat.

Los archivos de configuración que cree (.env.local) están en .gitignore y NO se subirán a GitHub.
