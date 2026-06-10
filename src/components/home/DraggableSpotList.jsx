import { useState, useEffect, useRef } from 'react';
import { GripVertical, MapPin } from 'lucide-react';
import { SPOT_ICONS } from './constants';

export default function DraggableSpotList({ spots, onReorder }) {
  const [items, setItems] = useState(spots);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const touchDragging = useRef(null);

  useEffect(() => { setItems(spots); }, [spots]);

  const onDragStart = (e, idx) => { setDragging(idx); e.dataTransfer.effectAllowed = 'move'; };
  const onDragOver  = (e, idx) => { e.preventDefault(); setDragOver(idx); };
  const onDrop = (e, idx) => {
    e.preventDefault();
    if (dragging === null || dragging === idx) return;
    const next = [...items];
    const [moved] = next.splice(dragging, 1);
    next.splice(idx, 0, moved);
    setItems(next); setDragging(null); setDragOver(null);
    onReorder(next);
  };
  const onDragEnd = () => { setDragging(null); setDragOver(null); };

  const onTouchStart = (e, idx) => { touchDragging.current = idx; setDragging(idx); };
  const onTouchMove = (e) => {
    if (touchDragging.current === null) return;
    e.preventDefault();
    const y = e.touches[0].clientY;
    document.querySelectorAll('[data-spot-idx]').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (y >= rect.top && y <= rect.bottom) setDragOver(parseInt(el.dataset.spotIdx));
    });
  };
  const onTouchEnd = () => {
    if (touchDragging.current !== null && dragOver !== null && touchDragging.current !== dragOver) {
      const next = [...items];
      const [moved] = next.splice(touchDragging.current, 1);
      next.splice(dragOver, 0, moved);
      setItems(next);
      onReorder(next);
    }
    touchDragging.current = null; setDragging(null); setDragOver(null);
  };

  return (
    <div onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      {items.map((spot, idx) => {
        const I = SPOT_ICONS[spot.type];
        return (
          <div key={spot.id}
            data-spot-idx={idx}
            draggable
            onDragStart={e => onDragStart(e, idx)}
            onDragOver={e => onDragOver(e, idx)}
            onDrop={e => onDrop(e, idx)}
            onDragEnd={onDragEnd}
            onTouchStart={e => onTouchStart(e, idx)}
            className={`flex items-center gap-3 px-4 py-3 border-t border-border transition-all select-none
              ${dragging === idx ? 'opacity-40 bg-secondary/50' : ''}
              ${dragOver === idx && dragging !== idx ? 'bg-accent/50 border-t-primary border-t-2' : ''}
            `}>
            <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0 cursor-grab active:cursor-grabbing touch-none" />
            {I ? <I size={16} className="text-muted-foreground" /> : <MapPin size={16} className="text-muted-foreground" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">{spot.title}</p>
              {spot.notes && <p className="text-xs text-muted-foreground truncate">{spot.notes}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
