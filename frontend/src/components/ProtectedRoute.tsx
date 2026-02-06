import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { IconLoader } from "@tabler/icons-react";

interface ProtectedRouteProps {
    children: JSX.Element;
    allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <IconLoader className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if user has no role assigned
    if (!user.role || user.role === 'user') {
        return (
            <div className="flex h-screen w-full items-center justify-center flex-col gap-4 p-8">
                <div className="text-center max-w-md">
                    <h1 className="text-2xl font-bold mb-2">Access Pending</h1>
                    <p className="text-muted-foreground mb-4">
                        Your account does not have a role assigned yet. Please contact an administrator to get access.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Email: {user.email}
                    </p>
                </div>
            </div>
        );
    }

    // Check role-based access
    if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
            // Redirect to appropriate dashboard based on user's role
            const redirectPath = getRoleBasedRedirect(user.role);
            return <Navigate to={redirectPath} replace />;
        }
    }

    return children;
}

// Helper function to get role-based redirect path
function getRoleBasedRedirect(role: string): string {
    switch (role) {
        case 'admin':
            return '/admin';
        case 'store_manager':
            return '/dashboard';
        case 'inventory_analyst':
            return '/analytics';
        case 'staff':
            return '/warehouse';
        default:
            return '/dashboard';
    }
}
