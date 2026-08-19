import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { supabase, isSupabaseConfigured } from './lib/supabase'
import LoginScreen from './components/LoginScreen'
import Onboarding from './components/Onboarding'
import AppLockScreen from './components/AppLockScreen'
import Navigation from './components/Navigation'
import TodoList from './components/TodoList'
import PeriodTracker from './components/PeriodTracker'
import HabitTracker from './components/HabitTracker'
import VisionBoard from './components/VisionBoard'
import Journal from './components/Journal'
import Reminders from './components/Reminders'

// Simple SVG icon replacements
const Heart = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
)

const CheckSquare = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Calendar = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const Target = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
)

const ImageIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const BookOpen = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const Bell = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
)

const SettingsIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

// Home Dashboard component
const Dashboard = ({ setCurrentView }) => {
  const { user, profile } = useAuth()
  
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-heading font-bold mb-2">
          {getGreeting()}, {profile?.name}! 🌸
        </h1>
        <p className="text-gray-600">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Vision Board Highlight */}
      <div className="card bg-gradient-purple">
        <div className="flex items-center gap-3 mb-3">
          <ImageIcon className="w-5 h-5 text-amethyst" />
          <h3 className="font-semibold">Vision Board</h3>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          Visualize your dreams and goals. What you focus on grows! ✨
        </p>
        <button
          onClick={() => setCurrentView('vision')}
          className="btn-secondary text-sm px-4 py-2"
        >
          Open Vision Board
        </button>
      </div>

      {/* Quick stats cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <CheckSquare className="w-6 h-6 text-amethyst mx-auto mb-2" />
          <p className="text-sm text-gray-600">Today's Tasks</p>
          <p className="text-lg font-semibold text-dolphin">Coming soon</p>
        </div>
        
        <div className="card text-center">
          <Target className="w-6 h-6 text-amethyst mx-auto mb-2" />
          <p className="text-sm text-gray-600">Habit Streak</p>
          <p className="text-lg font-semibold text-dolphin">Coming soon</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <h2 className="text-lg font-heading font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setCurrentView('journal')}
            className="flex items-center gap-2 p-3 bg-amethyst/10 rounded-xl text-left hover:bg-amethyst/20 transition-colors"
          >
            <BookOpen className="w-5 h-5 text-amethyst" />
            <span className="text-sm font-medium">Write in Journal</span>
          </button>
          
          <button 
            onClick={() => setCurrentView('period')}
            className="flex items-center gap-2 p-3 bg-amethyst/10 rounded-xl text-left hover:bg-amethyst/20 transition-colors"
          >
            <Calendar className="w-5 h-5 text-amethyst" />
            <span className="text-sm font-medium">Log Period</span>
          </button>
          
          <button 
            onClick={() => setCurrentView('vision')}
            className="flex items-center gap-2 p-3 bg-amethyst/10 rounded-xl text-left hover:bg-amethyst/20 transition-colors"
          >
            <ImageIcon className="w-5 h-5 text-amethyst" />
            <span className="text-sm font-medium">Vision Board</span>
          </button>
          
          <button 
            onClick={() => setCurrentView('reminders')}
            className="flex items-center gap-2 p-3 bg-amethyst/10 rounded-xl text-left hover:bg-amethyst/20 transition-colors"
          >
            <Bell className="w-5 h-5 text-amethyst" />
            <span className="text-sm font-medium">Reminders</span>
          </button>
        </div>
      </div>

      {/* More Options */}
      <div className="card">
        <h2 className="text-lg font-heading font-semibold mb-4">More</h2>
        <button
          onClick={() => setCurrentView('settings')}
          className="flex items-center gap-3 w-full p-3 bg-gray-50 rounded-xl text-left hover:bg-gray-100 transition-colors"
        >
          <SettingsIcon className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Settings & Privacy</span>
        </button>
      </div>

      {/* Motivational message */}
      <div className="card bg-gradient-to-r from-amethyst/10 to-dolphin/10 border-amethyst/20 text-center">
        <Heart className="w-8 h-8 text-amethyst mx-auto mb-2" />
        <p className="text-gray-700 font-medium">
          "Take care of your body. It's the only place you have to live."
        </p>
        <p className="text-sm text-gray-500 mt-1">— Jim Rohn</p>
      </div>
    </div>
  )
}

// Settings component
const Settings = () => {
  const { signOut, profile, user, updateProfile } = useAuth()
  const [isExporting, setIsExporting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [appLockEnabled, setAppLockEnabled] = useState(
    localStorage.getItem('wellness_app_lock_enabled') === 'true'
  )

  const exportUserData = async () => {
    setIsExporting(true)
    try {
      // Fetch all user data from different tables
      const [todos, periodLogs, habits, habitLogs, journalEntries, visionItems, reminders] = await Promise.all([
        supabase.from('todos').select('*').eq('user_id', user.id),
        supabase.from('period_logs').select('*').eq('user_id', user.id),
        supabase.from('habits').select('*').eq('user_id', user.id),
        supabase.from('habit_logs').select('*').eq('user_id', user.id),
        supabase.from('journal_entries').select('*').eq('user_id', user.id),
        supabase.from('vision_board_items').select('*').eq('user_id', user.id),
        supabase.from('reminders').select('*').eq('user_id', user.id)
      ])

      const userData = {
        profile: profile,
        exportDate: new Date().toISOString(),
        data: {
          todos: todos.data || [],
          periodLogs: periodLogs.data || [],
          habits: habits.data || [],
          habitLogs: habitLogs.data || [],
          journalEntries: journalEntries.data || [],
          visionBoardItems: visionItems.data || [],
          reminders: reminders.data || []
        }
      }

      // Create and download JSON file
      const dataStr = JSON.stringify(userData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `wellness-data-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)

      alert('Your data has been exported successfully!')
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Error exporting data. Please try again.')
    }
    setIsExporting(false)
  }

  const deleteUserAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      alert('Please type "DELETE" to confirm account deletion.')
      return
    }

    setIsDeleting(true)
    try {
      // Delete all user data (CASCADE will handle related data)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (error) throw error

      // Clear local storage
      localStorage.removeItem('wellness_app_pin')
      localStorage.removeItem('wellness_app_lock_enabled')

      // Sign out user
      await signOut()
      
      alert('Your account and all data have been permanently deleted.')
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Error deleting account. Please contact support.')
    }
    setIsDeleting(false)
    setShowDeleteConfirm(false)
  }

  const toggleAppLock = () => {
    if (appLockEnabled) {
      // Disable app lock
      localStorage.removeItem('wellness_app_pin')
      localStorage.setItem('wellness_app_lock_enabled', 'false')
      setAppLockEnabled(false)
    } else {
      // Enable app lock - prompt for PIN
      const pin = prompt('Create a 4-digit PIN for app lock:')
      if (pin && pin.length === 4 && /^\d+$/.test(pin)) {
        const hashedPin = btoa(pin)
        localStorage.setItem('wellness_app_pin', hashedPin)
        localStorage.setItem('wellness_app_lock_enabled', 'true')
        setAppLockEnabled(true)
        alert('App lock enabled! You will need your PIN to access the app.')
      } else {
        alert('Please enter a valid 4-digit PIN.')
      }
    }
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-heading font-semibold">Settings</h2>
      
      <div className="card">
        <h3 className="font-semibold mb-4">Account</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600">Name</label>
            <p className="font-medium">{profile?.name}</p>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600">Cycle Length</label>
            <p className="font-medium">{profile?.cycle_length || 'Not set'} days</p>
          </div>

          <div>
            <label className="block text-sm text-gray-600">Account Created</label>
            <p className="font-medium">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">Security</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">App Lock</p>
              <p className="text-sm text-gray-600">Require PIN to open the app</p>
            </div>
            <button
              onClick={toggleAppLock}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                appLockEnabled ? 'bg-amethyst' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  appLockEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h3 className="font-semibold mb-4">Privacy & Data</h3>
        <div className="space-y-4">
          <div className="bg-amethyst/10 rounded-lg p-3">
            <p className="text-sm text-gray-700 font-medium mb-1">🔒 Your Privacy Matters</p>
            <p className="text-xs text-gray-600">
              Your account data is securely stored and only accessible by you. 
              We never share your data with third parties.
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={exportUserData}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {isExporting ? 'Exporting...' : 'Export My Data'}
            </button>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Account Permanently
            </button>
          </div>
        </div>
      </div>
      
      <button
        onClick={signOut}
        className="w-full btn-secondary"
      >
        Sign Out
      </button>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Delete Account</h3>
            
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-800 font-medium mb-2">⚠️ This action cannot be undone!</p>
                <p className="text-xs text-red-700">
                  This will permanently delete your account and all associated data including:
                  tasks, period logs, habits, journal entries, vision board items, and reminders.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Type "DELETE" to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE here"
                  className="input-field"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={deleteUserAccount}
                  disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteConfirmText('')
                  }}
                  disabled={isDeleting}
                  className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Placeholder components for other features
const ComingSoon = ({ feature }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-heading font-semibold">{feature}</h2>
    <div className="card text-center py-8">
      <div className="text-6xl mb-4">🌸</div>
      <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
      <p className="text-gray-600">
        This feature is being built with care. Check back soon!
      </p>
    </div>
  </div>
)

// Main app content with navigation
const MainApp = () => {
  const [currentView, setCurrentView] = useState('dashboard')

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard setCurrentView={setCurrentView} />
      case 'todos':
        return <TodoList />
      case 'period':
        return <PeriodTracker />
      case 'habits':
        return <HabitTracker />
      case 'vision':
        return <VisionBoard />
      case 'journal':
        return <Journal />
      case 'reminders':
        return <Reminders />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-linen pb-20">
      <div className="max-w-md mx-auto p-4">
        {renderView()}
      </div>
      <Navigation currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  )
}

const AppContent = () => {
  const { user, profile, loading } = useAuth()
  const [isAppUnlocked, setIsAppUnlocked] = useState(false)

  useEffect(() => {
    // Check if app lock is enabled
    const lockEnabled = localStorage.getItem('wellness_app_lock_enabled') === 'true'
    if (!lockEnabled) {
      setIsAppUnlocked(true)
    }
  }, [])

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-linen flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center space-y-4 p-6 bg-white rounded-2xl shadow-lg border border-amethyst/20">
          <div className="w-16 h-16 bg-amethyst/10 rounded-full flex items-center justify-center mx-auto text-3xl">
            🌸
          </div>
          <h1 className="text-2xl font-heading font-bold text-gray-800">
            Setup Required
          </h1>
          <p className="text-gray-600 text-sm">
            Supabase environment variables are missing in your deployment.
          </p>
          <div className="bg-purple-50 border border-amethyst/20 rounded-xl p-4 text-left text-xs text-gray-700 space-y-2">
            <p className="font-semibold text-amethyst">How to fix in Netlify:</p>
            <ol className="list-decimal list-inside space-y-1.5 text-gray-600">
              <li>Open your Netlify Dashboard</li>
              <li>Go to <strong>Site configuration &rarr; Environment variables</strong></li>
              <li>Add <code className="bg-white px-1 py-0.5 rounded border">VITE_SUPABASE_URL</code></li>
              <li>Add <code className="bg-white px-1 py-0.5 rounded border">VITE_SUPABASE_ANON_KEY</code></li>
              <li>Go to <strong>Deploys &rarr; Trigger deploy &rarr; Clear cache and deploy site</strong></li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amethyst border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wellness space...</p>
        </div>
      </div>
    )
  }

  // Not signed in
  if (!user) {
    return <LoginScreen />
  }

  // App is locked and needs PIN
  if (!isAppUnlocked) {
    return <AppLockScreen onUnlock={() => setIsAppUnlocked(true)} />
  }

  // First time user - show onboarding
  if (!profile?.onboarding_completed) {
    return <Onboarding />
  }

  // Regular user - show main app
  return <MainApp />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App