import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { useThemeStore } from './store/themeStore.js'
import logger from './utils/logger.js'

// Apply saved theme before first render to avoid flash
const savedTheme = JSON.parse(localStorage.getItem('edu-theme') || '{}')?.state?.theme || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

// Global error handler
window.addEventListener('error', (event) => {
    logger.error('Global error caught', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
    });
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise,
    });
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
