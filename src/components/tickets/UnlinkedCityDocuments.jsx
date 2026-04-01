import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DocumentCard from './DocumentCard';
import { Paperclip } from 'lucide-react';

/**
 * Shows documents associated to a city but WITHOUT an itinerary_day_id.
 * These are documents with city_id set but no specific day assigned.
 */
export default function UnlinkedCityDocuments({ cityId, tripId, currentUserEmail }) {
  const { data: allTickets = [] } = useQuery({
    queryKey: ['tickets', tripId],
    queryFn: () => base44.entities.Ticket.filter({ trip_id: tripId }, '-date'),
    enabled: !!tripId,
  });

  // Filter: city_id matches, but NO itinerary_day_id
  const unlinkedDocs = allTickets.filter(t => {
    if (t.city_id !== cityId || t.itinerary_day_id) return false;
    const vis = t.visibility || 'personal';
    if (vis === 'personal') return t.created_by === currentUserEmail;
    if (vis === 'selected_users') return t.created_by === currentUserEmail || (t.shared_with || []).includes(currentUserEmail);
    return true;
  });

  if (unlinkedDocs.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <Paperclip className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-muted-foreground">Otros documentos</h3>
        <span className="text-xs bg-secondary text-muted-foreground font-semibold px-2 py-0.5 rounded-full">{unlinkedDocs.length}</span>
      </div>
      <div className="space-y-2">
        {unlinkedDocs.map(ticket => (
          <DocumentCard key={ticket.id} ticket={ticket} compact />
        ))}
      </div>
    </div>
  );
}