import { useState } from 'react';
import { Eye, EyeOff, Users, Pencil, Trash2, MapPin, CalendarDays, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PDFViewer from '@/components/PDFViewer';
import { CATEGORY_CONFIG } from './DocumentForm';

const VISIBILITY_BADGE = {
  personal:       { label: 'Solo yo',   icon: EyeOff, cls: 'bg-slate-100 text-slate-500' },
  shared:         { label: 'Grupo',      icon: Eye,    cls: 'bg-green-100 text-green-700' },
  selected_users: { label: 'Compartido', icon: Users,  cls: 'bg-blue-100 text-blue-700' },
};

export default function DocumentCard({ ticket, onEdit, onDelete, compact = false, cityName = '', dayTitle = '' }) {
  const [viewingPDF, setViewingPDF] = useState(null);

  const config = CATEGORY_CONFIG[ticket.category] || CATEGORY_CONFIG.other;
  const Icon = config.icon;
  const vis = VISIBILITY_BADGE[ticket.visibility || 'personal'];
  const VisIcon = vis.icon;

  const smartTitle = (ticket.origin && ticket.destination)
    ? `${ticket.origin} → ${ticket.destination}`
    : ticket.name;

  const dateStr = ticket.date
    ? format(new Date(ticket.date), "d MMM yyyy", { locale: es })
    : null;
  const endDateStr = ticket.end_date
    ? format(new Date(ticket.end_date), "d MMM yyyy", { locale: es })
    : null;

  const contextCity = ticket.city || cityName || null;
  const contextDay = dayTitle || null;
  const hasContext = contextCity || contextDay;

  // ── Compact variant ───────────────────────────────────────────────────────
  if (compact) {
    return (
      <>
        <div className="bg-white rounded-xl border border-border/60 shadow-sm p-3 flex items-center gap-3 hover:shadow-md hover:border-orange-200 transition-all">
          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">{smartTitle}</p>
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
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-orange-100 hover:text-orange-700 border border-gray-200 text-gray-600 text-xs font-semibold transition-colors flex-shrink-0"
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
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:border-orange-200 hover:bg-orange-50/20 transition-all duration-200 overflow-hidden">

        {/* Top stripe — category color */}
        <div className={`h-1 w-full bg-gradient-to-r ${config.color}`} />

        <div className="p-5 flex flex-col gap-4">

          {/* Header: icon + title + action icons */}
          <div className="flex items-start gap-3">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="font-bold text-gray-900 text-base leading-tight tracking-tight">{smartTitle}</h3>
              {ticket.name !== smartTitle && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{ticket.name}</p>
              )}
              <span className={`inline-block mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
                {config.label}
              </span>
            </div>
            {/* Action icons — discrete, top-right */}
            <div className="flex items-center gap-0.5 opacity-40 hover:opacity-100 transition-opacity flex-shrink-0">
              {onEdit && (
                <button
                  onClick={() => onEdit(ticket)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                  title="Editar"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(ticket)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Date */}
          {(dateStr || endDateStr) && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-medium text-gray-600">{dateStr}</span>
              {endDateStr && (
                <>
                  <span className="text-gray-300">→</span>
                  <span className="font-medium text-gray-600">{endDateStr}</span>
                </>
              )}
            </div>
          )}

          {/* Context: city · day */}
          {hasContext && (
            <div className="flex items-center gap-1.5 text-sm">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-orange-500" />
              <span className="font-semibold text-orange-700">
                {[contextCity, contextDay].filter(Boolean).join(' · ')}
              </span>
            </div>
          )}

          {/* Notes */}
          {ticket.notes && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{ticket.notes}</p>
          )}

          {/* Footer: visibility + view button */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${vis.cls}`}>
                <VisIcon className="w-3 h-3" />
                {vis.label}
              </span>
              {ticket.visibility === 'selected_users' && ticket.shared_with?.length > 0 && (
                <span className="text-xs text-muted-foreground">{ticket.shared_with.length} personas</span>
              )}
            </div>
            {ticket.file_url && (
              <button
                onClick={() => setViewingPDF(ticket.file_url)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gray-100 hover:bg-orange-100 hover:text-orange-700 border border-gray-200 hover:border-orange-300 text-gray-700 text-xs font-semibold shadow-sm transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                Ver documento
              </button>
            )}
          </div>

        </div>
      </div>
      <PDFViewer fileUrl={viewingPDF} onClose={() => setViewingPDF(null)} />
    </>
  );
}