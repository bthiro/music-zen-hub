import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AppProvider } from './contexts/AppContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <AppProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AppProvider>
  </ThemeProvider>
);
