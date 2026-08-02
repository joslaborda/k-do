import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export default function LeaveTripModal({
  open, onOpenChange, tripName, onConfirm, isPending
}) {
  const { t } = useTranslation();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">{t('trip.dialog.leaveTrip')}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>{t('trip.leaveWarning', { tripName })}</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <Button onClick={onConfirm} disabled={isPending} className="bg-destructive hover:bg-destructive/90 text-white">
            {isPending ? t('trip.dialog.leaving') : t('trip.dialog.leaveTrip')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
