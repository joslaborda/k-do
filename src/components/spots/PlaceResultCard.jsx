import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TYPE_CONFIG } from './spotsHelpers';
import { useTranslation } from 'react-i18next';

export default function PlaceResultCard({ place, onSave, saving, isDuplicate }) {
  const { t } = useTranslation();
  const tc = TYPE_CONFIG[place.type] || TYPE_CONFIG.custom;
  return (
    <div className={`bg-card rounded-2xl border flex overflow-hidden transition-all ${isDuplicate ? 'border-amber-200 opacity-60' : 'border-border hover:shadow-sm'}`}>
      <div className="w-12 bg-orange-50 flex items-center justify-center flex-shrink-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tc.color}`}>{tc.Icon && <tc.Icon size={16} />}</div>
      </div>
      <div className="flex-1 min-w-0 p-3">
        <p className="font-semibold text-sm text-foreground leading-tight">{place.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{t(tc.tk)}{place.address ? ' · ' + place.address : ''}</p>
        {isDuplicate ? (
          <p className="text-xs text-amber-600 mt-1.5 font-medium">{t('spots.alreadyInList')}</p>
        ) : (
          <Button size="sm" onClick={() => onSave(place)} disabled={saving}
            className="mt-2 h-7 text-xs bg-primary hover:bg-primary/90 text-white px-3">
            <Plus className="w-3 h-3 mr-1"/>{saving ? 'Guardando...' : 'Añadir'}
          </Button>
        )}
      </div>
    </div>
  );
}
