import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AppProvider } from './contexts/AppContext'
import { ThemeProvider } from './contexts/ThemeContext'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <AppProvider>
      <App />
    </AppProvider>
  </ThemeProvider>
);
