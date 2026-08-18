import React, { useState } from 'react'
// Simple SVG icon replacements
const Shield = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const Delete = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const AppLockScreen = ({ onUnlock }) => {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [isShaking, setIsShaking] = useState(false)

  const handlePinInput = (digit) => {
    if (pin.length < 4) {
      const newPin = pin + digit
      setPin(newPin)
      setError('')
      
      if (newPin.length === 4) {
        checkPin(newPin)
      }
    }
  }

  const handleDelete = () => {
    setPin(pin.slice(0, -1))
    setError('')
  }

  const checkPin = (inputPin) => {
    const storedPin = localStorage.getItem('wellness_app_pin')
    if (storedPin && btoa(inputPin) === storedPin) {
      onUnlock()
    } else {
      setError('Incorrect PIN')
      setPin('')
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
    }
  }

  const pinDots = Array(4).fill().map((_, index) => (
    <div
      key={index}
      className={`w-4 h-4 rounded-full border-2 border-dolphin ${
        index < pin.length ? 'bg-dolphin' : 'bg-transparent'
      }`}
    />
  ))

  return (
    <div className="min-h-screen bg-linen flex items-center justify-center p-4">
      <div className="card max-w-sm w-full text-center">
        <div className="mb-8">
          <Shield className="w-16 h-16 text-amethyst mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-semibold mb-2">
            Enter your PIN
          </h1>
          <p className="text-gray-600">
            Unlock your wellness space
          </p>
        </div>

        <div className={`mb-6 ${isShaking ? 'animate-shake' : ''}`}>
          <div className="flex justify-center space-x-3 mb-4">
            {pinDots}
          </div>
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </div>

        {/* PIN Keypad */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              onClick={() => handlePinInput(digit.toString())}
              className="w-16 h-16 mx-auto rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-lg font-semibold text-dolphin transition-colors duration-150"
            >
              {digit}
            </button>
          ))}
          
          <div /> {/* Empty space */}
          
          <button
            onClick={() => handlePinInput('0')}
            className="w-16 h-16 mx-auto rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-lg font-semibold text-dolphin transition-colors duration-150"
          >
            0
          </button>
          
          <button
            onClick={handleDelete}
            className="w-16 h-16 mx-auto rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-dolphin transition-colors duration-150 flex items-center justify-center"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Your wellness data is secure and private
        </p>
      </div>
    </div>
  )
}

export default AppLockScreen