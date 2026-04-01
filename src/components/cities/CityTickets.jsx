import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plane, Train, Hotel, Ticket, Shield, FileText, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PDFViewer from '@/components/PDFViewer';
import { useState } from 'react';

const categoryConfig = {
  flight: { label: 'Vuelo', icon: Plane, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  train: { label: 'Tren', icon: Train, bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  hotel: { label: 'Hotel', icon: Hotel, bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  freetour: { label: 'Free Tour', icon: Ticket, bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  insurance: { label: 'Seguro', icon: Shield, bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  personal: { label: 'Personal', icon: FileText, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' }
};

export default function CityTickets({ cityId, tripId }) {
  const [viewingPDF, setViewingPDF] = useState(null);

  const { data: allTickets = [] } = useQuery({
    queryKey: ['tickets', tripId],
    queryFn: () => base44.entities.Ticket.filter({ trip_id: tripId }, '-date'),
    enabled: !!tripId
  });

  // Show tickets where this city is origin OR destination
  const cityTickets = allTickets.filter(
    t => t.city_id === cityId || t.arrival_city_id === cityId
  );

  if (cityTickets.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Documentos 📄</h2>
      <div className="space-y-3">
        {cityTickets.map((ticket) => {
          const config = categoryConfig[ticket.category] || categoryConfig.personal;
          const Icon = config.icon;
          const isArrival = ticket.arrival_city_id === cityId && ticket.city_id !== cityId;
          return (
            <div
              key={ticket.id}
              className={`bg-white rounded-xl border ${config.border} p-4 flex items-center gap-4`}
            >
              <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${config.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">{ticket.name}</p>
                {ticket.origin && ticket.destination && (
                  <p className="text-xs font-medium text-orange-700 mt-0.5">{ticket.origin} → {ticket.destination}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span className={`${config.text} font-medium`}>{config.label}</span>
                  {isArrival && <span className="text-orange-600">· Llegada</span>}
                  {ticket.date && (
                    <span>· {format(new Date(ticket.date), "d MMM yyyy", { locale: es })}</span>
                  )}
                </div>
                {ticket.notes && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">{ticket.notes}</p>
                )}
              </div>
              {ticket.file_url && (
                <button
                  onClick={() => setViewingPDF(ticket.file_url)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-700 text-white text-xs font-medium hover:bg-orange-800 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Ver
                </button>
              )}
            </div>
          );
        })}
      </div>
      <PDFViewer fileUrl={viewingPDF} onClose={() => setViewingPDF(null)} />
    </div>
  );
}