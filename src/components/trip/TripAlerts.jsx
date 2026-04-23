import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { differenceInDays, parseISO, isValid } from 'date-fns';
import { Bell, Plane, Hotel, CalendarCheck, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

function AlertItem({ icon: Icon, color, bg, label, daysText, link, tripId }) {
  const content = (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bg} hover:opacity-90 transition-opacity`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color} bg-white/60 flex-shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{label}</p>
        <p className={`text-xs font-semibold ${color}`}>{daysText}</p>
      </div>
    </div>
  );

  return link ? (
    <Link to={createPageUrl(`${link}?trip_id=${tripId}`)}>{content}</Link>
  ) : content;
}

export default function TripAlerts({ tripId, cities, trip }) {
  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets', tripId],
    queryFn: () => base44.entities.Ticket.filter({ trip_id: tripId }),
    enabled: !!tripId,
    staleTime: 60000,
  });

  const alerts = useMemo(() => {
    const today = new Date();
    const result = [];

    // Vuelos y trenes
    tickets
      .filter(t => ['flight', 'train'].includes(t.category) && t.date)
      .forEach(t => {
        const d = parseISO(t.date);
        if (!isValid(d)) return;
        const diff = differenceInDays(d, today);
        if (diff >= 0 && diff <= 30) {
          result.push({
            id: t.id,
            icon: Plane,
            color: diff <= 3 ? 'text-red-600' : 'text-blue-600',
            bg: diff <= 3 ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200',
            label: t.name,
            daysText: diff === 0 ? '¡Hoy!' : diff === 1 ? 'Mañana' : `En ${diff} días`,
            link: 'Documents',
          });
        }
      });

    // Check-ins de hotel
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

    // Inicio de ciudad
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
            color: 'text-orange-600',
            bg: 'bg-orange-50 border-orange-200',
            label: `Llegada a ${c.name}`,
            daysText: diff === 0 ? '¡Hoy!' : diff === 1 ? 'Mañana' : `En ${diff} días`,
            link: 'Cities',
          });
        }
      });

    // Ordenar por urgencia
    return result.sort((a, b) => {
      const urgencyA = a.color.includes('red') ? 0 : 1;
      const urgencyB = b.color.includes('red') ? 0 : 1;
      return urgencyA - urgencyB;
    });
  }, [tickets, cities]);

  if (alerts.length === 0) return null;

  return (
    <div>
      <h2 className="text-slate-800 text-sm font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
        <Bell className="w-4 h-4 text-orange-600" />
        Alertas próximas
      </h2>
      <div className="grid sm:grid-cols-2 gap-2">
        {alerts.map(alert => (
          <AlertItem key={alert.id} {...alert} tripId={tripId} />
        ))}
      </div>
    </div>
  );
}