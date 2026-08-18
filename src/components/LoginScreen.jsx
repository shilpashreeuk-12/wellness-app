import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
// Simple SVG icon replacements
const Mail = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const Heart = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
)

const Sparkles = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l1.5 1.5L5 6 3.5 4.5 5 3zM19 3l1.5 1.5L19 6l-1.5-1.5L19 3zM12 8l2 2-2 2-2-2 2-2zM5 17l1.5 1.5L5 20l-1.5-1.5L5 17zM19 17l1.5 1.5L19 20l-1.5-1.5L19 17z" />
  </svg>
)

const LoginScreen = () => {
  const { signInWithGoogle, signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      console.log('🔵 Attempting Google sign-in...')
      await signInWithGoogle()
      console.log('✅ Google sign-in successful!')
    } catch (error) {
      console.error('❌ Google sign in error:', error)
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText
      })
      
      // More specific error messages
      if (error.message?.includes('provider is not enabled')) {
        alert('Google sign-in is not configured. Please check the setup guide in GOOGLE_OAUTH_SETUP.md')
      } else if (error.message?.includes('redirect_uri_mismatch')) {
        alert('Redirect URI mismatch. Please check Google OAuth configuration.')
      } else {
        alert(`Error signing in with Google: ${error.message || 'Please try again.'}`)
      }
    }
    setIsLoading(false)
  }

  const handleEmailSignIn = async (e) => {
    e.preventDefault()
    if (!email) return
    
    setIsLoading(true)
    try {
      await signInWithEmail(email)
      setEmailSent(true)
    } catch (error) {
      console.error('Email sign in error:', error)
      alert('Error sending magic link. Please try again.')
    }
    setIsLoading(false)
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-linen flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="mb-6">
            <Sparkles className="w-16 h-16 text-amethyst mx-auto mb-4" />
            <h1 className="text-2xl font-heading font-semibold mb-2">Check your email</h1>
            <p className="text-gray-600">
              We've sent you a magic link at <strong>{email}</strong>. 
              Click the link to sign in to your wellness space.
            </p>
          </div>
          <button
            onClick={() => {
              setEmailSent(false)
              setShowEmailForm(false)
              setEmail('')
            }}
            className="text-amethyst hover:text-amethyst/80 font-medium"
          >
            Try a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linen flex items-center justify-center p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <Heart className="w-16 h-16 text-amethyst mx-auto mb-4" />
          <h1 className="text-3xl font-heading font-bold mb-2">
            Welcome to Wellness
          </h1>
          <p className="text-gray-600">
            Your personal, private space for period tracking, habits, journaling, and more
          </p>
        </div>

        {!showEmailForm ? (
          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full btn-secondary flex items-center justify-center gap-3"
            >
              <Mail className="w-5 h-5" />
              Continue with Email
            </button>
          </div>
        ) : (
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="input-field"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full btn-primary"
            >
              {isLoading ? 'Sending magic link...' : 'Send magic link'}
            </button>
            
            <button
              type="button"
              onClick={() => setShowEmailForm(false)}
              className="w-full text-gray-600 hover:text-gray-800 text-sm"
            >
              Back to sign in options
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to keep your wellness journey private and secure. 
            Your data is never shared and always encrypted.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginScreen