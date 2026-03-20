import { createContext, useContext, type ReactNode } from "react";

import { useAuthUser } from "../hooks/queries";

interface AuthContextType {
    isAuthenticated: boolean;
    loading: boolean;
    user: any;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: user, isLoading } = useAuthUser();
    const isAuthenticated = !!user;
    const isAdmin = user?.role === "admin";

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, loading: isLoading, user, isAdmin }}
        >
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
