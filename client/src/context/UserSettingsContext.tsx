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

const UserSettingsContext = createContext<{
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  clearSettings: () => void;
}>({
  settings: defaultSettings,
  updateSettings: () => {},
  clearSettings: () => {},
});

export const UserSettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
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
};

export const useUserSettings = () => useContext(UserSettingsContext);

