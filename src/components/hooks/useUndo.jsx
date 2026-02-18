import { useCallback } from 'react';
import { toast } from 'sonner';

export function useUndo() {
  const performDelete = useCallback(async (deleteFn, restoreFn, itemName) => {
    // Execute delete
    await deleteFn();

    // Show undo toast
    toast.success(`${itemName} eliminado`, {
      action: {
        label: 'Deshacer',
        onClick: async () => {
          await restoreFn();
          toast.success(`${itemName} restaurado`);
        },
      },
      duration: 5000,
    });
  }, []);

  return { performDelete };
}