'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validToken, setValidToken] = useState(false)

  useEffect(() => {
    // Check if we have the required tokens from the URL
    const accessToken = searchParams.get('access_token')
    const type = searchParams.get('type')

    if (type === 'recovery' && accessToken) {
      setValidToken(true)
    } else {
      setError('Enlace de recuperación inválido o expirado')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate inputs
      const data = resetPasswordSchema.parse({ password, confirmPassword })

      // Get tokens from URL
      const accessToken = searchParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token')

      if (!accessToken) {
        throw new Error('Token de acceso no encontrado')
      }

      // Call reset password API
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: data.password,
          accessToken,
          refreshToken,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al restablecer la contraseña')
      }

      setSuccess(true)

      // Redirect to signin after 3 seconds
      setTimeout(() => {
        router.push('/signin')
      }, 3000)
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Error al restablecer la contraseña')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <header className="container-safe py-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
            DeonPay
          </Link>
        </nav>
      </header>

      {/* Reset Password Form */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            {!validToken ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                  <AlertCircle size={32} className="text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                  Enlace inválido
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {error || 'El enlace de recuperación es inválido o ha expirado'}
                </p>
                <Link
                  href="/forgot-password"
                  className="btn-primary inline-block"
                >
                  Solicitar nuevo enlace
                </Link>
              </div>
            ) : !success ? (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
                    <Lock size={32} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                    Nueva contraseña
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Ingresa tu nueva contraseña
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="error-message m-0">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="password" className="label-field">
                      Nueva contraseña
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
                        minLength={8}
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
                    <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
                  </div>

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
                        minLength={8}
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
                    {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    href="/signin"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    Volver a iniciar sesión
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                  <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                  ¡Contraseña restablecida!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Tu contraseña ha sido restablecida exitosamente
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Serás redirigido al inicio de sesión en unos segundos...
                </p>
                <Link
                  href="/signin"
                  className="btn-primary inline-block"
                >
                  Ir a iniciar sesión
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
