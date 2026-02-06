import { Button } from "@/components/ui/button";
import { IconLock } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

const NotAuthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-md p-8">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <IconLock className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="mb-6 text-muted-foreground">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <Button onClick={() => navigate("/login")}>
          Back to Login
        </Button>
      </div>
    </div>
  );
};

export default NotAuthorizedPage;
