'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [isResetPassword, setIsResetPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()

      if (isResetPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/auth/callback?next=/settings`,
        })
        if (error) throw error
        setMessage({
          type: 'success',
          text: 'Check your email for the password reset link.',
        })
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error

        setMessage({
          type: 'success',
          text: 'Account created! Logging you in...',
        })
        router.push('/dashboard')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error

        setMessage({
          type: 'success',
          text: 'Welcome back! Redirecting...',
        })
        router.push('/dashboard')
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An error occurred',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              LaunchPad
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Your personal launch command center
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md leading-5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  disabled={loading}
                />
              </div>
            </div>

            {!isResetPassword && (
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="block w-full pl-10 pr-10 py-2 border border-slate-300 dark:border-slate-600 rounded-md leading-5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                    disabled={loading}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {!isSignUp && (
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetPassword(true)
                        setMessage(null)
                      }}
                      className="text-xs font-medium text-primary-600 hover:text-primary-500 transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}
              </div>
            )}

            {message && (
              <div
                role="alert"
                aria-live="polite"
                className={`p-4 rounded-md ${message.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                  }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  {isResetPassword ? 'Sending link...' : isSignUp ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                isResetPassword ? 'Send reset link' : isSignUp ? 'Create account' : 'Sign in'
              )}
            </button>
          </form>

          {isResetPassword ? (
            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsResetPassword(false)
                  setMessage(null)
                }}
                className="font-medium text-primary-600 hover:text-primary-500 focus:outline-none transition-colors"
              >
                Sign in
              </button>
            </p>
          ) : (
            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
              {isSignUp ? 'Already have an account?' : 'Don\'t have an account?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setMessage(null)
                }}
                className="font-medium text-primary-600 hover:text-primary-500 focus:outline-none transition-colors"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
