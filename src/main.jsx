import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.jsx'
import { BookingProvider } from './core/BookingContext'
import { AuthProvider } from './core/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BookingProvider>
        <App />
        <Analytics />
      </BookingProvider>
    </AuthProvider>
  </StrictMode>,
)
