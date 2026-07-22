import { useToast } from "@/components/ui/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport } from
"@/components/ui/toast";

export function Toaster() {
  // Antes ToastClose no recibía ningún onClick — el botón se dibujaba pero
  // tocarlo no hacía nada. `dismiss` sí existe en useToast(), solo faltaba
  // pasárselo.
  const { toasts, dismiss } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description &&
              <ToastDescription>{description}</ToastDescription>
              }
            </div>
            {action}
            <ToastClose onClick={() => dismiss(id)} />
          </Toast>);

      })}

    </ToastProvider>);

}