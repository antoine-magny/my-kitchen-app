'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { EXISTING_ACCOUNT_MESSAGE, isExistingAccountSignUp } from '@/lib/auth-signup'
import {
  GOOGLE_AUTH_ERROR_MESSAGE,
  googleAuthErrorMessage,
  loginOAuthErrorMessage,
  signInWithGoogle,
} from '@/lib/auth-google'
import { EyeIcon, EyeOffIcon, GoogleIcon } from '@/components/icons'
import { useRouter } from 'next/navigation'

const inputClass =
  'appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#2E5B3E] focus:border-[#2E5B3E] sm:text-sm'

type LoginFormProps = {
  oauthError?: string
}

export function LoginForm({ oauthError }: LoginFormProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState<'email' | 'google' | null>(null)
  const [error, setError] = useState<string | null>(loginOAuthErrorMessage(oauthError))
  const router = useRouter()
  const supabase = createClient()

  const isSignup = mode === 'signup'
  const busy = loading !== null

  const handleGoogleAuth = async () => {
    setLoading('google')
    setError(null)
    try {
      const { error: googleError } = await signInWithGoogle(supabase, window.location.origin)
      if (googleError) throw googleError
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? googleAuthErrorMessage(err)
          : GOOGLE_AUTH_ERROR_MESSAGE,
      )
      setLoading(null)
    }
  }

  const handleAuth = async () => {
    const trimmedName = firstName.trim()
    if (isSignup && !trimmedName) {
      setError('Veuillez indiquer votre prénom')
      return
    }

    setLoading('email')
    setError(null)

    try {
      if (isSignup) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: trimmedName },
          },
        })
        if (isExistingAccountSignUp(signUpError, data.user)) {
          setError(EXISTING_ACCOUNT_MESSAGE)
          return
        }
        if (signUpError) throw signUpError
        alert("Vérifiez vos emails pour confirmer l'inscription (si nécessaire), sinon vous pouvez vous connecter directement si auto-confirmé.")
        setMode('login')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
        router.push('/')
        router.refresh()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F9F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#2E5B3E]">
          My Kitchen App
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isSignup
            ? 'Créez votre compte pour commencer'
            : 'Vous avez déjà un compte ? Connectez-vous !'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-md bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setError(null)
              }}
              className={`rounded px-3 py-2 text-sm font-medium transition-colors ${
                !isSignup ? 'bg-white text-[#2E5B3E] shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setError(null)
              }}
              className={`rounded px-3 py-2 text-sm font-medium transition-colors ${
                isSignup ? 'bg-white text-[#2E5B3E] shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Inscription
            </button>
          </div>

          <button
            type="button"
            onClick={() => void handleGoogleAuth()}
            disabled={busy}
            className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E5B3E] disabled:opacity-50"
          >
            <GoogleIcon size={18} />
            {loading === 'google' ? 'Redirection...' : 'Continuer avec Google'}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">ou</span>
            </div>
          </div>

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault()
              void handleAuth()
            }}
          >
            {isSignup && (
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <div className="mt-1">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2E5B3E] hover:bg-[#23452f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E5B3E] disabled:opacity-50"
            >
              {loading === 'email' ? '...' : isSignup ? "S'inscrire" : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
