'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getMe } from '@/lib/auth';

export interface JwtUser {
  id: string;
  phone: string;
  role: string;
  name: string;
}

interface AuthCtx {
  user: JwtUser | null;
  loading: boolean;
  setUser: (u: JwtUser | null) => void;
}

const AuthContext = createContext<AuthCtx>({ user: null, loading: true, setUser: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<JwtUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe().then((u) => { setUser(u); setLoading(false); });
  }, []);

  return <AuthContext.Provider value={{ user, loading, setUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
