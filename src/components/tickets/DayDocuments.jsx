import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DocumentCard from './DocumentCard';
import { FileText } from 'lucide-react';

/**
 * Shows documents associated to a specific itinerary day.
 * Shown inside CityDetail, within each day's collapsible.
 */
export default function DayDocuments({ dayId, tripId, currentUserEmail, dayTitle = '' }) {
  const { data: allTickets = [] } = useQuery({
    queryKey: ['tickets', tripId],
    queryFn: () => base44.entities.Ticket.filter({ trip_id: tripId }, '-date'),
    enabled: !!tripId,
  });

  const dayDocs = allTickets.filter(t => {
    if (t.itinerary_day_id !== dayId) return false;
    // Visibility filter
    if (t.visibility === 'personal') return t.user_id === currentUserEmail || t.created_by === currentUserEmail;
    if (t.visibility === 'selected_users') {
      return t.created_by === currentUserEmail || (t.shared_with || []).includes(currentUserEmail);
    }
    return true; // shared
  });

  if (dayDocs.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="w-4 h-4 text-orange-600" />
        <span className="text-sm font-semibold text-foreground">Documentos del día</span>
      </div>
      <div className="space-y-2">
        {dayDocs.map(ticket => (
          <DocumentCard key={ticket.id} ticket={ticket} compact dayTitle={dayTitle} />
        ))}
      </div>
    </div>
  );
}