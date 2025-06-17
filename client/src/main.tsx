import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import LoginPage from './pages/LoginPage.tsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import SignUpPage from './pages/SignUpPage.tsx';
import ChatPage from './pages/ChatPage.tsx';
import { AppLayout } from './components/layout/AppLayout.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
 <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
   <BrowserRouter>
        <AppLayout>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
      </AppLayout>
    </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
)
