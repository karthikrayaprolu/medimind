import { CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  const getIcon = (variant?: string) => {
    switch (variant) {
      case "destructive":
        return (
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-4.5 w-4.5 text-destructive" strokeWidth={2} />
          </div>
        );
      case "success":
        return (
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Info className="h-4.5 w-4.5 text-primary" strokeWidth={2} />
          </div>
        );
    }
  };

  return (
    <ToastProvider>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        variant,
        ...props
      }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            {getIcon(variant ?? undefined)}
            <div className="grid gap-0.5 flex-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
