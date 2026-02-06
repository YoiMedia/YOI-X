import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";

export type User = Doc<"users">;

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  magicLink: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<Id<"users"> | null>(() => {
    return localStorage.getItem("yoi_userId") as Id<"users"> | null;
  });

  const user = useQuery(api.users.getById, userId ? { id: userId } : "skip");
  const loginMutation = useMutation(api.users.login);
  const magicLinkMutation = useMutation(api.users.magicLink);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId && user === undefined) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [userId, user]);

  const login = async (username: string, password: string) => {
    const loggedInUser = await loginMutation({ username, password });
    setUserId(loggedInUser._id);
    localStorage.setItem("yoi_userId", loggedInUser._id);
  };

  const magicLink = async (email: string) => {
    const loggedInUser = await magicLinkMutation({ email });
    setUserId(loggedInUser._id);
    localStorage.setItem("yoi_userId", loggedInUser._id);
  };

  const logout = () => {
    setUserId(null);
    localStorage.removeItem("yoi_userId");
  };

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, login, magicLink, logout }}>
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
