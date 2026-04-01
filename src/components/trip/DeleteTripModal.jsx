import { useState } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function DeleteTripModal({ open, onOpenChange, tripName, onConfirm, isPending }) {
  const [inputValue, setInputValue] = useState('');
  const matches = inputValue === tripName;

  return (
    <AlertDialog open={open} onOpenChange={(v) => { onOpenChange(v); setInputValue(''); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">⚠️ Eliminar viaje</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>Esta acción es <strong>irreversible</strong>. Se eliminarán todos los datos del viaje.</p>
            <p>Escribe el nombre del viaje exactamente para confirmar:</p>
            <p className="font-mono font-bold text-foreground bg-secondary px-3 py-1.5 rounded-lg">{tripName}</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          placeholder="Escribe el nombre del viaje..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="my-2"
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <Button
            onClick={onConfirm}
            disabled={!matches || isPending}
            className="bg-destructive hover:bg-destructive/90 text-white"
          >
            {isPending ? 'Eliminando...' : 'Eliminar viaje'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}