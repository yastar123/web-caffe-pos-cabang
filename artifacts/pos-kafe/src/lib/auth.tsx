import { createContext, useContext, useEffect, useState } from "react";
import { User, useLogin, useLogout, useGetMe, LoginInput } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const queryClient = useQueryClient();

  const { data: user, isLoading: isMeLoading } = useGetMe({
    query: {
      enabled: !!token,
      queryKey: ["me"],
    },
  });

  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const login = async (data: LoginInput) => {
    const res = await loginMutation.mutateAsync({ data });
    setToken(res.token);
    localStorage.setItem("token", res.token);
    queryClient.setQueryData(["me"], res.user);
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      setToken(null);
      localStorage.removeItem("token");
      queryClient.setQueryData(["me"], null);
      queryClient.clear();
    }
  };

  const isLoading = isMeLoading && !!token;

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
