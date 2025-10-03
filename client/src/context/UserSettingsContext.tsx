/** context/UserSettingsContext.tsx
 *
 * Provides global state for user settings (theme, username, role, chat session).
 * - Persists settings in localStorage across reloads.
 * - Generates a new `chatSession` UUID when cleared.
 * - Exposes `updateSettings` for partial updates and `clearSettings` to reset.
 * - Consumed via `useUserSettings()` hook inside React components.
 */

import { createContext, useContext, useState } from "react";
import type { UserSettings } from "@/types/user_settings";

const defaultSettings: UserSettings = {
  theme: "dark",
  userName: null,
  chatSession: crypto.randomUUID(),
  role: "viewer",
};

interface UserSettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  clearSettings: () => void;
}

const UserSettingsContext = createContext<UserSettingsContextType | null>(null);

interface Props {
  children: React.ReactNode;
}

export function UserSettingsProvider({ children }: Props) {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem("user-settings");
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem("user-settings", JSON.stringify(updated));
      return updated;
    });
  };

  const clearSettings = () => {
    localStorage.removeItem("user-settings");
    setSettings({
      ...defaultSettings,
      chatSession: crypto.randomUUID(),
    });
  };

  return (
    <UserSettingsContext.Provider
      value={{ settings, updateSettings, clearSettings }}
    >
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettings() {
  const context = useContext(UserSettingsContext);
  if (!context) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
}

