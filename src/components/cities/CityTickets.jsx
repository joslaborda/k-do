import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DocumentCard from '@/components/tickets/DocumentCard';
import { FileText } from 'lucide-react';

/**
 * Shows documents associated to a specific city (origin or destination).
 * Shown inside CityDetail above the itinerary days.
 */
export default function CityTickets({ cityId, tripId, currentUserEmail, userId }) {
  const { data: allTickets = [] } = useQuery({
    queryKey: ['tickets', tripId],
    queryFn: () => base44.entities.Ticket.filter({ trip_id: tripId }, '-date'),
    enabled: !!tripId,
  });

  const cityDocs = allTickets.filter(t => {
    if (t.city_id !== cityId && t.arrival_city_id !== cityId) return false;
    const vis = t.visibility || 'personal';
    if (vis === 'personal') return t.created_by === currentUserEmail || t.user_id === userId;
    if (vis === 'selected_users') return t.created_by === currentUserEmail || (t.shared_with || []).includes(currentUserEmail);
    return true;
  });

  if (cityDocs.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-5 h-5 text-orange-600" />
        <h2 className="text-lg font-semibold text-foreground">Documentos</h2>
        <span className="text-xs bg-orange-200 text-orange-800 font-semibold px-2 py-0.5 rounded-full">{cityDocs.length}</span>
      </div>
      <div className="space-y-2">
        {cityDocs.map(ticket => (
          <DocumentCard key={ticket.id} ticket={ticket} compact cityName={city?.name} />
        ))}
      </div>
    </div>
  );
}