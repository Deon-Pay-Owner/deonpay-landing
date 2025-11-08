'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { signUpSchema, type SignUpFormData, PROFILE_TYPE_LABELS, type ProfileType } from '@/lib/schemas/signup'
import PhoneInput from '@/components/PhoneInput'

export default function SignUpPage() {
  // Form state
  const [profileType, setProfileType] = useState<ProfileType>('merchant_owner')
  const [merchantName, setMerchantName] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // UI state
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate confirm password matches
      if (password !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden')
      }

      // Validate all fields with Zod
      const validatedData: SignUpFormData = signUpSchema.parse({
        profile_type: profileType,
        merchant_name: merchantName,
        full_name: fullName,
        email,
        phone,
        password,
      })

      // Call signup API
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear la cuenta')
      }

      if (result.pendingVerification) {
        setSuccess(true)
      } else if (result.redirectTo) {
        // Redirect to dashboard immediately
        window.location.href = result.redirectTo
      }
    } catch (err: any) {
      if (err.errors) {
        // Zod validation error
        setError(err.errors[0].message)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Error al crear la cuenta')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col">
        <header className="container-safe py-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
              DeonPay
            </Link>
            <Link href="/" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              Volver al inicio
            </Link>
          </nav>
        </header>

        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                ¡Cuenta creada exitosamente!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Hemos enviado un correo de verificación a <strong className="text-gray-900 dark:text-white">{email}</strong>.
                Por favor, revisa tu bandeja de entrada y haz clic en el enlace
                para activar tu cuenta.
              </p>
              <Link href="/signin" className="btn-primary inline-block">
                Ir a iniciar sesión
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <header className="container-safe py-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
            DeonPay
          </Link>
          <Link href="/" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            Volver al inicio
          </Link>
        </nav>
      </header>

      {/* Sign Up Form */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <h1 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">
              Crear cuenta
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
              Comienza a usar DeonPay hoy
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="error-message m-0">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Profile Type */}
              <div>
                <label className="label-field">¿Cuál es tu perfil?</label>
                <div className="space-y-2">
                  {(Object.entries(PROFILE_TYPE_LABELS) as [ProfileType, string][]).map(([value, label]) => (
                    <label
                      key={value}
                      className="flex items-center gap-3 p-3 border border-[var(--color-border)] rounded-lg cursor-pointer hover:border-[var(--color-primary)] transition-colors"
                    >
                      <input
                        type="radio"
                        name="profile_type"
                        value={value}
                        checked={profileType === value}
                        onChange={(e) => setProfileType(e.target.value as ProfileType)}
                        disabled={loading}
                        className="w-4 h-4 text-[var(--color-primary)]"
                      />
                      <span className="text-sm font-medium text-[var(--color-textPrimary)]">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Merchant Name */}
              <div>
                <label htmlFor="merchantName" className="label-field">
                  Nombre del comercio o proyecto
                </label>
                <input
                  id="merchantName"
                  type="text"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className="input-field"
                  placeholder="Mi Empresa S.A. de C.V."
                  required
                  disabled={loading}
                />
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="label-field">
                  Tu nombre completo
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field"
                  placeholder="Juan Pérez"
                  required
                  disabled={loading}
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="label-field">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="tu@email.com"
                  required
                  disabled={loading}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="label-field">
                  Teléfono o WhatsApp
                </label>
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  defaultCountry="MX"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="label-field">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-12"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? (
                      <EyeOff size={20} className="text-gray-500" />
                    ) : (
                      <Eye size={20} className="text-gray-500" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo 8 caracteres
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="label-field">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pr-12"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                    aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} className="text-gray-500" />
                    ) : (
                      <Eye size={20} className="text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                ¿Ya tienes cuenta?{' '}
                <Link
                  href="/signin"
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold"
                >
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
