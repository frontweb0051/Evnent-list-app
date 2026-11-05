// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { 
  getMe,
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
} from "@/api/auth";
import type { User } from "@/types/user";

type AuthContextValue = {
  user: User | null,
  isLoading: boolean,
  login: (email:string, password:string) => Promise<void>,
  register: (name: string, email: string, password: string) => Promise<void>,
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {    
      try {
        const me = await getMe();
        setUser(me);
      } catch (err) {
        console.error('ユーザーの取得に失敗しました。',err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMe();
  }, []);

  const login = async (email: string, password: string):Promise<void> => {
    const loggedInUser = await loginApi(email, password);
    setUser(loggedInUser);
  }

  const register = async (name: string, email: string, password: string): Promise<void> => {
    const newUser = await registerApi(name,email,password)
    setUser(newUser);
  }

  const logout = async ():Promise<void> => {
    await logoutApi();
    setUser(null);
  }

  const value: AuthContextValue = {
    user: user,
    isLoading: isLoading,
    login: login,
    register: register,
    logout: logout,
  }
  // contextのvalue値が変更されたらレンダリングされる
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("AuthProvider の中で使用してください");
  }
  return context;
}