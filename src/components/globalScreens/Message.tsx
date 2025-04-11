// components/common/NotFound.tsx
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface NotFoundProps {
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
}

export function NotFound({
  title = "Not Found",
  message = "The resource you're looking for doesn't exist or has been removed.",
  showHomeButton = true,
  showBackButton = true,
}: NotFoundProps) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <div className="text-center space-y-4">
        <FileQuestion className="h-16 w-16 text-muted-foreground mx-auto" />
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground max-w-md mx-auto">{message}</p>

        <div className="flex gap-4 justify-center mt-6">
          {showBackButton && (
            <Button variant="outline" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          )}
          {showHomeButton && (
            <Button onClick={() => navigate("/")}>Return Home</Button>
          )}
        </div>
      </div>
    </div>
  );
}
