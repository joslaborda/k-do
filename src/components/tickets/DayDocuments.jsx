import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DocumentCard from './DocumentCard';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Shows documents associated to a specific itinerary day.
 * Shown inside CityDetail, within each day's collapsible.
 */
export default function DayDocuments({ dayId, tripId, currentUserEmail, currentUserId, dayTitle = '' }) {
  const { t } = useTranslation();
  const { data: allTickets = [] } = useQuery({
    queryKey: ['tickets', tripId],
    queryFn: () => base44.entities.Ticket.filter({ trip_id: tripId }, '-date'),
    enabled: !!tripId,
  });

  const dayDocs = allTickets.filter(t => {
    if (t.itinerary_day_id !== dayId) return false;
    // Visibility filter. `t.user_id` es el id del usuario, no un email — se
    // comparaba contra currentUserEmail y nunca coincidía, así que un
    // documento "solo yo" creado sin created_by (o con created_by distinto al
    // email actual, p.ej. tras un cambio de email) desaparecía para su propio
    // dueño. Se compara contra currentUserId, que sí es un id.
    if (t.visibility === 'personal') return t.user_id === currentUserId || t.created_by === currentUserEmail;
    if (t.visibility === 'selected_users') {
      return t.created_by === currentUserEmail || (t.shared_with || []).includes(currentUserEmail);
    }
    return true; // shared
  });

  if (dayDocs.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground">{t('documents.dayDocs')}</span>
      </div>
      <div className="space-y-1.5">
        {dayDocs.map(ticket => (
          <DocumentCard key={ticket.id} ticket={ticket} compact dayTitle={dayTitle} />
        ))}
      </div>
    </div>
  );
}