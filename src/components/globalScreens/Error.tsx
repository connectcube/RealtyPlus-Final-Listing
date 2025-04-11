// components/common/ErrorMessage.tsx
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
  title?: string;
  message: string;
  retry?: () => void;
}

export function ErrorMessage({
  title = "Error",
  message,
  retry,
}: ErrorMessageProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="text-sm text-red-700">{message}</p>
          {retry && (
            <Button variant="outline" className="mt-4" onClick={retry}>
              Try Again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
