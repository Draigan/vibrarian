export type UserSettings = {
  theme: "light" | "dark";
  userName: string | null;
  chatSession: string;
  role: 'admin' | 'viewer' | 'editor';
};

