import { z } from 'zod';

/**
 * Profile type options
 */
export type ProfileType = 'merchant_owner' | 'developer' | 'agency';

export const PROFILE_TYPE_LABELS: Record<ProfileType, string> = {
  merchant_owner: 'Dueño de negocio',
  developer: 'Desarrollador',
  agency: 'Agencia',
};

/**
 * Validation schema for sign up form
 * Ensures all required onboarding data is collected
 */
export const signUpSchema = z.object({
  profile_type: z.enum(['merchant_owner', 'developer', 'agency'], {
    required_error: 'Por favor selecciona tu perfil',
    invalid_type_error: 'Perfil inválido',
  }),
  merchant_name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(80, 'El nombre no puede exceder 80 caracteres')
    .trim(),
  full_name: z
    .string()
    .min(2, 'Tu nombre debe tener al menos 2 caracteres')
    .max(80, 'Tu nombre no puede exceder 80 caracteres')
    .trim(),
  email: z
    .string()
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .min(7, 'Teléfono debe tener al menos 7 dígitos')
    .max(20, 'Teléfono no puede exceder 20 caracteres')
    .regex(/^[\d\s\+\-\(\)]+$/, 'Teléfono contiene caracteres inválidos')
    .trim(),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres'),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;
