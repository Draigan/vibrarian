import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ChatPage from "./pages/ChatPage";
import ProtectedRoute from "./ProtectedRoute"; 
import LogoutPage from "./pages/LogoutPage";
import WelcomePage from "./pages/WelcomePage";
import { useSessionListener } from "./hooks/useSessionListener";

export default function App() {
  useSessionListener(10000);
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/logout" element={<LogoutPage />} />
      {/* Protect /chat route */}
      <Route element={<ProtectedRoute />}>
        <Route path="/chat" element={<ChatPage />} />
      </Route>

      {/* Home route */}
      <Route path="/" element={<WelcomePage />} />
    </Routes>
  );
}
