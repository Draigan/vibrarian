import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ChatPage from "./pages/ChatPage";
import ProtectedRoute from "./ProtectedRoute";
import LogoutPage from "./pages/LogoutPage";
import WelcomePage from "./pages/WelcomePage";
import TranscriptsPage from "./pages/TranscriptsPage";
import { useSessionListener } from "./hooks/useSessionListener";
import Test from "./components/chat/Test";

export default function App() {
  useSessionListener(); // Needs fixing
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/logout" element={<LogoutPage />} />
      <Route path="/test" element={<Test />} />

      {/* Protect /chat route */}
      <Route element={<ProtectedRoute />}>
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/transcripts" element={<TranscriptsPage />} />
      </Route>

      {/* Home route */}
      <Route path="/" element={<WelcomePage />} />
    </Routes>
  );
}
