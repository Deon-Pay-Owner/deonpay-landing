'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import { z } from 'zod'

const emailSchema = z.object({
  email: z.string().email('Email inválido'),
})

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate email
      const data = emailSchema.parse({ email })

      // Call forgot password API
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al enviar el correo')
      }

      setSuccess(true)
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Error al procesar la solicitud')
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
          <Link href="/signin" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
            <ArrowLeft size={16} />
            Volver a iniciar sesión
          </Link>
        </nav>
      </header>

      {/* Forgot Password Form */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            {!success ? (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
                    <Mail size={32} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                    ¿Olvidaste tu contraseña?
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="error-message m-0">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
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

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    href="/signin"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={16} />
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
                  ¡Correo enviado!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Hemos enviado un enlace de recuperación a <strong>{email}</strong>
                </p>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-6">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>📧 Revisa tu bandeja de entrada</strong>
                    <br />
                    El enlace expirará en 1 hora. Si no ves el correo, revisa tu carpeta de spam.
                  </p>
                </div>
                <Link
                  href="/signin"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Volver a iniciar sesión
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
