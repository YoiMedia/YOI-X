import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";

export type User = Doc<"users">;

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  magicLink: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<Id<"users"> | null>(() => {
    const saved = localStorage.getItem("yoi_userId");
    return saved ? (saved as Id<"users">) : null;
  });

  const user = useQuery(api.users.getById, userId ? { userId: userId } : "skip");
  const loginMutation = useMutation(api.users.login);

  const login = async (email: string, password: string) => {
    try {
      const result = await loginMutation({ email, password });
      setUserId(result._id);
      localStorage.setItem("yoi_userId", result._id);
    } catch (err) {
      throw err;
    }
  };

  const magicLink = async (email: string) => {
    // Legacy system might not have had a full magic link implementation, 
    // or it was just a mock. Restoring as a placeholder or based on previous logic.
    throw new Error("Magic link not implemented in legacy system");
  };

  const logout = () => {
    setUserId(null);
    localStorage.removeItem("yoi_userId");
  };

  const isLoading = userId !== null && user === undefined;

  return (
    <AuthContext.Provider value={{ 
      user: user ?? null, 
      isLoading, 
      login, 
      magicLink, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}