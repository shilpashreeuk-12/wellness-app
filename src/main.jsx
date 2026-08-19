import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif', background: '#FCF8F2' }}>
          <div style={{ maxWidth: '420px', background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>Something went wrong</h2>
            <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <button onClick={() => window.location.reload()} style={{ background: '#655A7C', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

