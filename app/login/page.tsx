'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (action: 'login' | 'signup') => {
    setLoading(true)
    setError(null)
    
    try {
      if (action === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        alert("Vérifiez vos emails pour confirmer l'inscription (si nécessaire), sinon vous pouvez vous connecter directement si auto-confirmé.")
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F9F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#2E5B3E]">
          My Kitchen App
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Connectez-vous pour accéder à vos données
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#2E5B3E] focus:border-[#2E5B3E] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#2E5B3E] focus:border-[#2E5B3E] sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleAuth('login')}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2E5B3E] hover:bg-[#23452f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E5B3E] disabled:opacity-50"
              >
                {loading ? '...' : 'Se connecter'}
              </button>
              <button
                type="button"
                onClick={() => handleAuth('signup')}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-[#2E5B3E] rounded-md shadow-sm text-sm font-medium text-[#2E5B3E] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E5B3E] disabled:opacity-50"
              >
                S'inscrire
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
