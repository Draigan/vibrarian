import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

const SESSION_KEY = "currentSessionId";

export function useChatSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      setSessionId(stored);
    } else {
      const uuid = uuidv4();
      selectSession(uuid);
    }
  }, []);

  const selectSession = (id: string) => {
    localStorage.setItem(SESSION_KEY, id);
    setSessionId(id);
  };

  const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
    setSessionId(null);
  };

  return {
    sessionId,
    setSessionId: selectSession,
    clearSession,
  };
}

