import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    avatar_url?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const checkAuth = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`import.meta.env.VITE_API_URL || "http://localhost:5000"/api/auth/me`, {
                headers: {
                    "x-auth-token": token,
                },
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                localStorage.removeItem("token");
                setUser(null);
            }
        } catch (error) {
            console.error("Auth check failed", error);
            localStorage.removeItem("token");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem("token", token);
        setUser(userData);
        toast.success(`Welcome back, ${userData.username || userData.email}!`);

        // Role-based routing
        switch (userData.role) {
            case 'admin':
                navigate("/dashboard");
                break;
            case 'store_manager':
                navigate("/dashboard");
                break;
            case 'inventory_analyst':
                navigate("/analytics");
                break;
            case 'staff':
                navigate("/dashboard");
                break;
            default:
                navigate("/dashboard");
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        toast.info("Logged out successfully");
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
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
