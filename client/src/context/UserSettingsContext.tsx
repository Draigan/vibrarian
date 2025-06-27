// context/UserSettingsContext.tsx
import { createContext, useContext, useState } from "react";

type UserSettings = {
  theme: "light" | "dark";
  currentSessionId: string | null;
};

const defaultSettings: UserSettings = {
  theme: "dark",
  currentSessionId: null,
};

const UserSettingsContext = createContext<{
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
}>({
  settings: defaultSettings,
  updateSettings: () => {},
});

export const UserSettingsProvider = ({ children }: { children: React.ReactNode }) => {
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

  return (
    <UserSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </UserSettingsContext.Provider>
  );
};

export const useUserSettings = () => useContext(UserSettingsContext);
