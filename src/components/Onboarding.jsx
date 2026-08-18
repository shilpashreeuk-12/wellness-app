import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
// Simple SVG icon replacements
const Heart = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
)

const Calendar = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const Shield = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const Sparkles = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l1.5 1.5L5 6 3.5 4.5 5 3zM19 3l1.5 1.5L19 6l-1.5-1.5L19 3zM12 8l2 2-2 2-2-2 2-2zM5 17l1.5 1.5L5 20l-1.5-1.5L5 17zM19 17l1.5 1.5L19 20l-1.5-1.5L19 17z" />
  </svg>
)

const Onboarding = () => {
  const { user, updateProfile } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || '',
    cycleLength: 28,
    lastPeriodDate: '',
    wantsAppLock: false,
    pin: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const steps = [
    {
      title: "What should we call you?",
      subtitle: "Let's personalize your wellness space",
      icon: Heart,
      component: NameStep
    },
    {
      title: "Period tracking (optional)",
      subtitle: "Help us predict your cycle",
      icon: Calendar,
      component: PeriodStep
    },
    {
      title: "App security",
      subtitle: "Keep your data private",
      icon: Shield,
      component: SecurityStep
    },
    {
      title: "You're all set!",
      subtitle: "Welcome to your wellness journey",
      icon: Sparkles,
      component: WelcomeStep
    }
  ]

  const currentStepData = steps[currentStep]
  const StepComponent = currentStepData.component

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleSkip = () => {
    if (currentStep === 1) { // Period tracking step
      setFormData({
        ...formData,
        cycleLength: null,
        lastPeriodDate: null
      })
    } else if (currentStep === 2) { // Security step
      setFormData({
        ...formData,
        wantsAppLock: false,
        pin: ''
      })
    }
    handleNext()
  }

  const handleFinish = async () => {
    setIsLoading(true)
    try {
      const profileData = {
        name: formData.name,
        cycle_length: formData.cycleLength,
        last_period_date: formData.lastPeriodDate || null,
        onboarding_completed: true
      }

      // Store PIN locally if user wants app lock
      if (formData.wantsAppLock && formData.pin) {
        // Simple hash for PIN (in production, use proper hashing)
        const hashedPin = btoa(formData.pin)
        localStorage.setItem('wellness_app_pin', hashedPin)
        localStorage.setItem('wellness_app_lock_enabled', 'true')
      }

      await updateProfile(profileData)
    } catch (error) {
      console.error('Error completing onboarding:', error)
      alert('Error completing setup. Please try again.')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-linen flex items-center justify-center p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <currentStepData.icon className="w-16 h-16 text-amethyst mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-semibold mb-2">
            {currentStepData.title}
          </h1>
          <p className="text-gray-600">
            {currentStepData.subtitle}
          </p>
        </div>

        <StepComponent 
          formData={formData}
          setFormData={setFormData}
          onNext={handleNext}
          onSkip={handleSkip}
          onFinish={handleFinish}
          isLoading={isLoading}
        />

        {/* Progress indicator */}
        <div className="mt-8 flex justify-center space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index <= currentStep ? 'bg-amethyst' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const NameStep = ({ formData, setFormData, onNext }) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Your name
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter your name"
          className="input-field"
        />
      </div>
      
      <button
        onClick={onNext}
        disabled={!formData.name.trim()}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  )
}

const PeriodStep = ({ formData, setFormData, onNext, onSkip }) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="cycleLength" className="block text-sm font-medium text-gray-700 mb-2">
          Average cycle length (days)
        </label>
        <input
          id="cycleLength"
          type="number"
          min="21"
          max="35"
          value={formData.cycleLength}
          onChange={(e) => setFormData({ ...formData, cycleLength: parseInt(e.target.value) })}
          className="input-field"
        />
      </div>
      
      <div>
        <label htmlFor="lastPeriod" className="block text-sm font-medium text-gray-700 mb-2">
          Last period start date (optional)
        </label>
        <input
          id="lastPeriod"
          type="date"
          value={formData.lastPeriodDate}
          onChange={(e) => setFormData({ ...formData, lastPeriodDate: e.target.value })}
          className="input-field"
        />
      </div>
      
      <div className="space-y-2">
        <button onClick={onNext} className="w-full btn-primary">
          Continue
        </button>
        <button onClick={onSkip} className="w-full text-gray-600 hover:text-gray-800 text-sm">
          Skip for now
        </button>
      </div>
    </div>
  )
}

const SecurityStep = ({ formData, setFormData, onNext, onSkip }) => {
  const [confirmPin, setConfirmPin] = useState('')
  const [pinError, setPinError] = useState('')

  const handleToggleLock = (enabled) => {
    setFormData({ ...formData, wantsAppLock: enabled, pin: enabled ? formData.pin : '' })
    if (!enabled) {
      setConfirmPin('')
      setPinError('')
    }
  }

  const handlePinChange = (pin) => {
    setFormData({ ...formData, pin })
    setPinError('')
  }

  const handleContinue = () => {
    if (formData.wantsAppLock) {
      if (formData.pin.length !== 4) {
        setPinError('PIN must be 4 digits')
        return
      }
      if (formData.pin !== confirmPin) {
        setPinError('PINs do not match')
        return
      }
    }
    onNext()
  }

  return (
    <div className="space-y-4">
      <div className="bg-amethyst/10 rounded-xl p-4 text-sm text-gray-700">
        <p className="font-medium mb-2">Your privacy matters</p>
        <p>Add a PIN to protect your wellness data when the app is opened.</p>
      </div>

      <div className="space-y-3">
        <label className="flex items-center space-x-3">
          <input
            type="radio"
            name="appLock"
            checked={!formData.wantsAppLock}
            onChange={() => handleToggleLock(false)}
            className="text-amethyst focus:ring-amethyst"
          />
          <span>No PIN needed</span>
        </label>
        
        <label className="flex items-center space-x-3">
          <input
            type="radio"
            name="appLock"
            checked={formData.wantsAppLock}
            onChange={() => handleToggleLock(true)}
            className="text-amethyst focus:ring-amethyst"
          />
          <span>Protect with PIN</span>
        </label>
      </div>

      {formData.wantsAppLock && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Create 4-digit PIN
            </label>
            <input
              type="password"
              maxLength="4"
              pattern="[0-9]{4}"
              value={formData.pin}
              onChange={(e) => handlePinChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="0000"
              className="input-field text-center text-lg tracking-widest"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm PIN
            </label>
            <input
              type="password"
              maxLength="4"
              pattern="[0-9]{4}"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="0000"
              className="input-field text-center text-lg tracking-widest"
            />
          </div>
          
          {pinError && (
            <p className="text-red-500 text-sm">{pinError}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <button onClick={handleContinue} className="w-full btn-primary">
          Continue
        </button>
        <button onClick={onSkip} className="w-full text-gray-600 hover:text-gray-800 text-sm">
          Skip for now
        </button>
      </div>
    </div>
  )
}

const WelcomeStep = ({ formData, onFinish, isLoading }) => {
  return (
    <div className="space-y-6 text-center">
      <div>
        <h2 className="text-xl font-heading font-semibold mb-2">
          Welcome, {formData.name}! 🌸
        </h2>
        <p className="text-gray-600">
          Your personal wellness space is ready. Start tracking your journey and building healthy habits.
        </p>
      </div>
      
      <button
        onClick={onFinish}
        disabled={isLoading}
        className="w-full btn-primary"
      >
        {isLoading ? 'Setting up...' : 'Enter your wellness space'}
      </button>
    </div>
  )
}

export default Onboarding