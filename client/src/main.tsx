import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/css/index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import { AppLayout } from './components/layout/AppLayout.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserSettingsProvider } from './context/UserSettingsContext.tsx';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserSettingsProvider>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <AppLayout>
              <App />
            </AppLayout>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
    </UserSettingsProvider>
  </StrictMode>
)
