import { useState } from 'react';
import { Eye, EyeOff, Users, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import PDFViewer from '@/components/PDFViewer';
import { CATEGORY_CONFIG } from './DocumentForm';

const VISIBILITY_BADGE = {
  personal:       { label: 'Solo yo',       icon: EyeOff,  cls: 'bg-slate-100 text-slate-600' },
  shared:         { label: 'Grupo',          icon: Eye,     cls: 'bg-green-100 text-green-700' },
  selected_users: { label: 'Seleccionados',  icon: Users,   cls: 'bg-blue-100 text-blue-700' },
};

export default function DocumentCard({ ticket, onEdit, onDelete, compact = false }) {
  const [viewingPDF, setViewingPDF] = useState(null);

  const config = CATEGORY_CONFIG[ticket.category] || CATEGORY_CONFIG.other;
  const Icon = config.icon;
  const vis = VISIBILITY_BADGE[ticket.visibility || 'personal'];
  const VisIcon = vis.icon;

  const dateStr = ticket.date
    ? format(new Date(ticket.date), "d MMM yyyy", { locale: es })
    : null;
  const endDateStr = ticket.end_date
    ? format(new Date(ticket.end_date), "d MMM yyyy", { locale: es })
    : null;

  if (compact) {
    return (
      <>
        <div className={`bg-white rounded-xl border ${config.border} p-3 flex items-center gap-3`}>
          <div className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-4 h-4 ${config.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">{ticket.name}</p>
            {ticket.origin && ticket.destination && (
              <p className="text-xs font-medium text-orange-700">{ticket.origin} → {ticket.destination}</p>
            )}
            {ticket.city && !ticket.origin && (
              <p className="text-xs text-muted-foreground">{ticket.city}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span className={`${config.text} font-medium`}>{config.label}</span>
              {dateStr && <span>· {dateStr}</span>}
              {endDateStr && <span>→ {endDateStr}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {ticket.file_url && (
              <button
                onClick={() => setViewingPDF(ticket.file_url)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-700 text-white text-xs font-medium hover:bg-orange-800 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                Ver
              </button>
            )}
          </div>
        </div>
        <PDFViewer fileUrl={viewingPDF} onClose={() => setViewingPDF(null)} />
      </>
    );
  }

  return (
    <>
      <div className="bg-white p-5 rounded-2xl border-2 border-border/50 hover:shadow-lg hover:border-orange-200 transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground text-base truncate">{ticket.name}</h3>
              {ticket.origin && ticket.destination && (
                <p className="text-sm font-semibold text-orange-700 mt-0.5">{ticket.origin} → {ticket.destination}</p>
              )}
              {ticket.city && !ticket.origin && (
                <p className="text-sm text-muted-foreground mt-0.5">{ticket.city}</p>
              )}
              {ticket.airline && (
                <p className="text-xs text-muted-foreground">{ticket.airline}</p>
              )}
              {ticket.doc_type && (
                <p className="text-xs text-muted-foreground">{ticket.doc_type}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            {onEdit && (
              <Button variant="ghost" size="icon" onClick={() => onEdit(ticket)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                <Pencil className="w-3.5 h-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="icon" onClick={() => onDelete(ticket)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Dates */}
        {(dateStr || endDateStr) && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
            <span>{dateStr}</span>
            {endDateStr && <><span>→</span><span>{endDateStr}</span></>}
          </div>
        )}

        {ticket.notes && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{ticket.notes}</p>
        )}

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
          {/* Visibility badge */}
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
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-700 text-white text-xs font-semibold hover:bg-orange-800 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver documento
            </button>
          )}
        </div>
      </div>
      <PDFViewer fileUrl={viewingPDF} onClose={() => setViewingPDF(null)} />
    </>
  );
}