'use client'

import { useState } from 'react'
import Link from 'next/link'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-client'

const signUpSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate inputs
      const data = signUpSchema.parse({ email, password, confirmPassword })

      // Create Supabase client
      const supabase = createClient()

      // Sign up user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/signin`,
        },
      })

      if (signUpError) {
        throw new Error(signUpError.message)
      }

      if (signUpData.user) {
        setSuccess(true)
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
        <header className="container-safe py-6">
          <nav className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              DeonPay
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Volver al inicio
            </Link>
          </nav>
        </header>

        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
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
              <h1 className="text-2xl font-bold mb-2">
                ¡Cuenta creada exitosamente!
              </h1>
              <p className="text-gray-600 mb-6">
                Hemos enviado un correo de verificación a <strong>{email}</strong>.
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Header */}
      <header className="container-safe py-6">
        <nav className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            DeonPay
          </Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Volver al inicio
          </Link>
        </nav>
      </header>

      {/* Sign Up Form */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-center mb-2">
              Crear cuenta
            </h1>
            <p className="text-center text-gray-600 mb-8">
              Comienza a usar DeonPay hoy
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="error-message m-0">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="label-field">
                  Email
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

              <div>
                <label htmlFor="password" className="label-field">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo 8 caracteres
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label-field">
                  Confirmar contraseña
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
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
              <p className="text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link
                  href="/signin"
                  className="text-primary-600 hover:text-primary-700 font-semibold"
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
