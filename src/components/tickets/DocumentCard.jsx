import { useState } from 'react';
import { Eye, EyeOff, Users, Pencil, Trash2, MapPin, CalendarDays, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PDFViewer from '@/components/PDFViewer';
import { CATEGORY_CONFIG } from './DocumentForm';

const VISIBILITY_BADGE = {
  personal:       { label: 'Solo yo',     icon: EyeOff, cls: 'bg-slate-100 text-slate-500' },
  shared:         { label: 'Grupo',        icon: Eye,    cls: 'bg-green-100 text-green-700' },
  selected_users: { label: 'Compartido',   icon: Users,  cls: 'bg-blue-100 text-blue-700' },
};

export default function DocumentCard({ ticket, onEdit, onDelete, compact = false, cityName = '', dayTitle = '' }) {
  const [viewingPDF, setViewingPDF] = useState(null);

  const config = CATEGORY_CONFIG[ticket.category] || CATEGORY_CONFIG.other;
  const Icon = config.icon;
  const vis = VISIBILITY_BADGE[ticket.visibility || 'personal'];
  const VisIcon = vis.icon;

  // Smart title: origin → destination takes priority
  const smartTitle = (ticket.origin && ticket.destination)
    ? `${ticket.origin} → ${ticket.destination}`
    : ticket.name;

  const dateStr = ticket.date
    ? format(new Date(ticket.date), "d MMM yyyy", { locale: es })
    : null;
  const endDateStr = ticket.end_date
    ? format(new Date(ticket.end_date), "d MMM yyyy", { locale: es })
    : null;

  // Context: city + day
  const contextCity = ticket.city || cityName || null;
  const contextDay = dayTitle || null;
  const hasContext = contextCity || contextDay;

  // ── Compact variant (used inside CityTickets / DayDocuments) ─────────────
  if (compact) {
    return (
      <>
        <div className={`bg-white rounded-xl border ${config.border} p-3 flex items-center gap-3`}>
          <div className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-4 h-4 ${config.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">{smartTitle}</p>
            {ticket.name !== smartTitle && (
              <p className="text-xs text-muted-foreground truncate">{ticket.name}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span className={`${config.text} font-medium`}>{config.label}</span>
              {dateStr && <span>· {dateStr}</span>}
              {endDateStr && <span>→ {endDateStr}</span>}
            </div>
          </div>
          {ticket.file_url && (
            <button
              onClick={() => setViewingPDF(ticket.file_url)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80 transition-colors flex-shrink-0"
            >
              <Eye className="w-3.5 h-3.5" />
              Ver
            </button>
          )}
        </div>
        <PDFViewer fileUrl={viewingPDF} onClose={() => setViewingPDF(null)} />
      </>
    );
  }

  // ── Full card ─────────────────────────────────────────────────────────────
  return (
    <>
      <div className="bg-white rounded-2xl border border-border/60 hover:border-orange-200 hover:shadow-md transition-all p-5 flex flex-col gap-3">

        {/* Row 1 — Category icon + Title + Action icons */}
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-base leading-snug">{smartTitle}</h3>
            {/* Show original name as subtitle if smart title differs */}
            {ticket.name !== smartTitle && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{ticket.name}</p>
            )}
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0 -mt-0.5">
            {onEdit && (
              <button
                onClick={() => onEdit(ticket)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="Editar"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(ticket)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Row 2 — Date */}
        {(dateStr || endDateStr) && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{dateStr}</span>
            {endDateStr && <><span className="text-muted-foreground/50">→</span><span>{endDateStr}</span></>}
          </div>
        )}

        {/* Row 3 — Context: city · day */}
        {hasContext && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-orange-500" />
            <span className="text-orange-700 font-medium">
              {[contextCity, contextDay].filter(Boolean).join(' · ')}
            </span>
          </div>
        )}

        {/* Row 4 — Notes */}
        {ticket.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2">{ticket.notes}</p>
        )}

        {/* Row 5 — Footer: visibility + view button */}
        <div className="flex items-center gap-2 pt-1 border-t border-border/40 mt-auto">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${vis.cls}`}>
            <VisIcon className="w-3 h-3" />
            {vis.label}
          </span>
          {ticket.visibility === 'selected_users' && ticket.shared_with?.length > 0 && (
            <span className="text-xs text-muted-foreground">{ticket.shared_with.length} personas</span>
          )}
          {ticket.file_url && (
            <button
              onClick={() => setViewingPDF(ticket.file_url)}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Ver documento
            </button>
          )}
        </div>
      </div>
      <PDFViewer fileUrl={viewingPDF} onClose={() => setViewingPDF(null)} />
    </>
  );
}