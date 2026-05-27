import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { differenceInDays, parseISO, isValid } from 'date-fns';
import { Train as TrainIcon, Hotel, CalendarCheck, X } from 'lucide-react';
import { PlaneIcon, BusFront } from '@/lib/icons';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

function AlertItem({ icon: Icon, color, bg, label, daysText, link, tripId, onDismiss }) {
  const content = (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bg} hover:opacity-90 transition-opacity`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color} bg-white/60 flex-shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{label}</p>
        <p className={`text-xs font-semibold ${color}`}>{daysText}</p>
      </div>
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); onDismiss(); }}
        className="w-6 h-6 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center flex-shrink-0 transition-colors"
      >
        <X className="w-3 h-3 text-foreground/60" />
      </button>
    </div>
  );

  return link ? (
    <Link to={createPageUrl(`${link}?trip_id=${tripId}`)}>{content}</Link>
  ) : content;
}

export default function TripAlerts({ tripId, cities, trip, onUrgentCount }) {
  const [dismissed, setDismissed] = useState(new Set());
  // Tick every minute so hour-level countdowns stay fresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets', tripId],
    queryFn: () => base44.entities.Ticket.filter({ trip_id: tripId }),
    enabled: !!tripId,
    staleTime: 60000,
  });

  const alerts = useMemo(() => {
    const today = new Date();
    const result = [];

    tickets
      .filter(t => ['flight', 'train', 'bus'].includes(t.category) && t.date)
      .forEach(t => {
        const d = parseISO(t.date);
        if (!isValid(d)) return;
        const diff = differenceInDays(d, today);
        if (diff < 0 || diff > 30) return;

        // Hour-level countdown for today's transport
        let daysText;
        let color;
        let bg;
        if (diff === 0 && t.time) {
          const [h, m] = t.time.split(':').map(Number);
          const depDate = new Date(d);
          depDate.setHours(h, m, 0, 0);
          const diffMs = depDate - today;
          const diffMin = Math.round(diffMs / 60000);
          if (diffMin < 0) {
            daysText = 'En curso';
            color = 'text-gray-500';
            bg = 'bg-gray-50 border-gray-200';
          } else if (diffMin <= 240) {
            // ≤4h — urgent alert
            const hrs = Math.floor(diffMin / 60);
            const mins = diffMin % 60;
            daysText = hrs > 0 ? `Sale en ${hrs}h${mins > 0 ? ` ${mins}min` : ''}` : `Sale en ${diffMin} min`;
            color = diffMin <= 60 ? 'text-red-600' : 'text-orange-600';
            bg = diffMin <= 60 ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200';
          } else {
            daysText = `Hoy a las ${t.time}`;
            color = 'text-blue-600';
            bg = 'bg-blue-50 border-blue-200';
          }
        } else if (diff === 0) {
          daysText = '¡Hoy!';
          color = 'text-red-600';
          bg = 'bg-red-50 border-red-200';
        } else if (diff === 1) {
          daysText = 'Mañana' + (t.time ? ` a las ${t.time}` : '');
          color = 'text-blue-600';
          bg = 'bg-blue-50 border-blue-200';
        } else {
          daysText = `En ${diff} días`;
          color = 'text-blue-600';
          bg = 'bg-blue-50 border-blue-200';
        }

        result.push({
          id: t.id,
          icon: t.category === 'train' ? TrainIcon : PlaneIcon,
          color, bg,
          label: t.name,
          daysText,
          urgent: diff === 0 && t.time && (() => {
            const [h, m] = t.time.split(':').map(Number);
            const dep = new Date(d); dep.setHours(h, m, 0, 0);
            return (dep - today) / 60000 <= 240;
          })(),
          link: 'Documents',
        });
      });

    tickets
      .filter(t => t.category === 'hotel' && t.date)
      .forEach(t => {
        const d = parseISO(t.date);
        if (!isValid(d)) return;
        const diff = differenceInDays(d, today);
        if (diff >= 0 && diff <= 14) {
          result.push({
            id: t.id + '_hotel',
            icon: Hotel,
            color: diff <= 1 ? 'text-red-600' : 'text-green-600',
            bg: diff <= 1 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200',
            label: `Check-in: ${t.name}`,
            daysText: diff === 0 ? '¡Hoy!' : diff === 1 ? 'Mañana' : `En ${diff} días`,
            link: 'Documents',
          });
        }
      });

    cities
      .filter(c => c.start_date)
      .forEach(c => {
        const d = parseISO(c.start_date);
        if (!isValid(d)) return;
        const diff = differenceInDays(d, today);
        if (diff >= 0 && diff <= 7) {
          result.push({
            id: c.id + '_city',
            icon: CalendarCheck,
            color: 'text-primary',
            bg: 'bg-orange-50 border-orange-200',
            label: `Llegada a ${c.name}`,
            daysText: diff === 0 ? '¡Hoy!' : diff === 1 ? 'Mañana' : `En ${diff} días`,
            link: 'Cities',
          });
        }
      });

    return result.sort((a, b) => {
      // Urgent (≤4h) first, then red, then rest
      const uA = a.urgent ? 0 : a.color.includes('red') ? 1 : 2;
      const uB = b.urgent ? 0 : b.color.includes('red') ? 1 : 2;
      return uA - uB;
    });
  }, [tickets, cities]);

  const urgent = alerts.filter(a => a.urgent && !dismissed.has(a.id));

  useEffect(() => {
    onUrgentCount?.(urgent.length);
  }, [urgent.length]);

  return null;
}