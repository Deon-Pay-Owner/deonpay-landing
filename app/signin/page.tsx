'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { z } from 'zod'

const signInSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate inputs
      const data = signInSchema.parse({ email, password })

      // Call login API
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al iniciar sesión')
      }

      if (result.ok && result.redirectTo) {
        // Redirect to dashboard
        window.location.href = result.redirectTo
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Error al iniciar sesión')
      }
    } finally {
      setLoading(false)
    }
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

      {/* Sign In Form */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-center mb-2">
              Iniciar sesión
            </h1>
            <p className="text-center text-gray-600 mb-8">
              Accede a tu cuenta de DeonPay
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
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                ¿No tienes cuenta?{' '}
                <Link
                  href="/signup"
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Crear cuenta
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
