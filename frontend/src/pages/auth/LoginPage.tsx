import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { IconPackage, IconEye, IconEyeOff, IconBrandGoogle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleGoogleLogin = () => {
    window.location.href = "https://invt-nzwm.onrender.com/api/auth/google/callback";
  };

  // Check for token or error in URL on load
  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error === "no_role") {
      toast.error("Access Denied", {
        description: "No role has been assigned to your account. Please contact an administrator.",
      });
      navigate("/login", { replace: true });
      return;
    }

    if (error === "unauthorized") {
      toast.error("Unauthorized Access", {
        description: "Your email is not authorized. Please contact an administrator to get access.",
      });
      navigate("/login", { replace: true });
      return;
    }

    if (token) {
      // Fetch user data with this token
      const fetchUserData = async () => {
        try {
          const response = await fetch("http://localhost:5000/api/auth/me", {
            headers: {
              "x-auth-token": token,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            login(token, userData);
          } else {
            toast.error("Authentication failed");
            navigate("/login", { replace: true });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Authentication failed");
          navigate("/login", { replace: true });
        }
      };

      fetchUserData();
    }
  }, [searchParams, navigate, login]);

  // Redirect if already logged in
  useEffect(() => {
    if (user && user.role && user.role !== 'user') {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
      } else {
        toast.error("Login Failed", {
          description: data.msg || "Invalid credentials",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login Failed", {
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center  p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center gap-3">
            <div className="flex aspect-square size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <IconPackage className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground text-center">
                INVT
              </h1>
              {/* <p className="text-sm text-muted-foreground">
                Retail Optimization System
              </p> */}
            </div>
          </div>
        </div>

        <Card className="shadow-xl border-border/50">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-4xl ">Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="abhishek@gmail.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="h-11"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-11 w-11 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <IconEyeOff className="size-4" />
                    ) : (
                      <IconEye className="size-4" />
                    )}
                    <span className="sr-only">Toggle password visibility</span>
                  </Button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-4">
              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                   <p>
                      Or continue with
                    </p>  
                </div>
              </div>

              <Button
                type="button"

                className="w-full h-11"
                onClick={handleGoogleLogin}
              >
                <IconBrandGoogle className="mr-2 size-4" />
                Login with Google
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Need access?{" "}
                <a href="#" className="text-primary hover:underline">
                  Contact your administrator
                </a>
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        {/* <p className="text-center text-sm text-muted-foreground mt-8">
          © 2024 InventoryPro. All rights reserved.
        </p> */}
      </div>
    </div>
  );
}
