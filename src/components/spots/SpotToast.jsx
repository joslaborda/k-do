import { CheckCircle2 } from 'lucide-react';

export default function SpotToast({ spot, city, onUndo, visible }) {
  if (!visible || !spot) return null;
  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-foreground rounded-xl px-4 py-3 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-500" />
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">Guardado{city ? ' en ' + city : ''}</p>
          <p className="text-white/60 text-xs truncate">{spot.title}</p>
        </div>
        <button onClick={onUndo} className="text-amber-400 text-xs font-medium flex-shrink-0">Deshacer</button>
      </div>
    </div>
  );
}
