import { useState } from 'react';
import { Hotel, Check, X, Pencil } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function AccommodationInput({ city, tripId }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(city.accommodation || '');
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
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

  if (!editing) {
    return (
      <div
        className="mt-2 flex items-center gap-1.5 cursor-pointer group/acc"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditing(true); }}
      >
        <Hotel className="w-3 h-3 text-white/60 flex-shrink-0" />
        {city.accommodation ? (
          <span className="text-white/80 text-xs truncate">{city.accommodation}</span>
        ) : (
          <span className="text-white/40 text-xs italic">Añadir alojamiento</span>
        )}
        <Pencil className="w-2.5 h-2.5 text-white/0 group-hover/acc:text-white/60 transition-colors flex-shrink-0 ml-auto" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSave}
      className="mt-2"
      onClick={(e) => { e.stopPropagation(); }}
    >
      <div className="flex items-center gap-1">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ej: Hotel Granvia Kyoto"
          className="flex-1 text-xs bg-white/20 text-white placeholder:text-white/40 border border-white/30 rounded px-2 py-1 outline-none focus:border-white/60"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          type="submit"
          disabled={saving}
          className="p-1 bg-white/20 hover:bg-white/30 rounded text-white"
        >
          <Check className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="p-1 bg-white/10 hover:bg-white/20 rounded text-white"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      <p className="text-white/40 text-[10px] mt-1">Usa nombre completo + ciudad para mayor precisión</p>
    </form>
  );
}