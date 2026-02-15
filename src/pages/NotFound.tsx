import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import LogoIcon from "@/components/LogoIcon";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-sm">
        <div className="mb-6 inline-block">
          <LogoIcon size={56} className="text-primary" />
        </div>
        <h1 className="mb-2 text-5xl font-extrabold text-foreground tracking-tight">
          404
        </h1>
        <p className="mb-6 text-lg text-muted-foreground">
          This page doesn't exist or has been moved.
        </p>
        <Button
          onClick={() => navigate("/")}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-none font-semibold px-6"
        >
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
