import { useState } from 'react';
import { Hotel, Check, X, Pencil } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function AccommodationInput({ city, tripId }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(city.accommodation || '');
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.City.update(city.id, { accommodation: value });
    queryClient.invalidateQueries({ queryKey: ['cities', tripId] });
    setSaving(false);
    setEditing(false);
  };

  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setValue(city.accommodation || '');
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleSave();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setValue(city.accommodation || '');
      setEditing(false);
    }
  };

  if (!editing) {
    return (
      <div
        className="mt-2 flex items-center gap-1.5 cursor-pointer group/acc"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditing(true); }}
      >
        <Hotel className="w-3 h-3 text-white/60 flex-shrink-0" />
        {city.accommodation ? (
          <span className="text-white/80 text-xs truncate max-w-[75%]">{city.accommodation}</span>
        ) : (
          <span className="text-white/40 text-xs italic">Añadir alojamiento</span>
        )}
        <Pencil className="w-2.5 h-2.5 text-white/0 group-hover/acc:text-white/60 transition-colors flex-shrink-0" />
      </div>
    );
  }

  return (
    <div
      className="mt-2"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <div className="flex items-center gap-1">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ej: Hotel Granvia Kyoto"
          className="flex-1 min-w-0 text-xs bg-white/20 text-white placeholder:text-white/40 border border-white/30 rounded px-2 py-1 outline-none focus:border-white/60"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          type="button"
          disabled={saving}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSave(); }}
          className="flex-shrink-0 p-1 bg-white/20 hover:bg-white/30 rounded text-white"
        >
          <Check className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="flex-shrink-0 p-1 bg-white/10 hover:bg-white/20 rounded text-white"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}