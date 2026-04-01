import { useState } from 'react';
import { Eye, EyeOff, Users, Pencil, Trash2, MapPin, CalendarDays, FileText } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import PDFViewer from '@/components/PDFViewer';
import { CATEGORY_CONFIG } from './DocumentForm';

// Categories not in CATEGORY_CONFIG (legacy data) → fallback mapping
const CATEGORY_FALLBACK = {
  freetour:  'event',
  insurance: 'other',
};

const VISIBILITY_BADGE = {
  personal:       { label: 'Solo yo',    icon: EyeOff, cls: 'bg-gray-100 text-gray-400' },
  shared:         { label: 'Grupo',      icon: Eye,    cls: 'bg-green-50 text-green-600' },
  selected_users: { label: 'Compartido', icon: Users,  cls: 'bg-blue-50 text-blue-500'  },
};

const ICON_BG = {
  flight:   'bg-blue-50 text-blue-500',
  train:    'bg-emerald-50 text-emerald-500',
  hotel:    'bg-purple-50 text-purple-500',
  event:    'bg-orange-50 text-orange-500',
  personal: 'bg-amber-50 text-amber-500',
  other:    'bg-gray-100 text-gray-400',
};

export default function DocumentCard({ ticket, onEdit, onDelete, compact = false, cityName = '', dayTitle = '' }) {
  const [viewingPDF, setViewingPDF] = useState(null);

  // Resolve category — legacy values fall back gracefully
  const resolvedCat = CATEGORY_CONFIG[ticket.category]
    ? ticket.category
    : (CATEGORY_FALLBACK[ticket.category] || 'other');

  const config  = CATEGORY_CONFIG[resolvedCat];
  const Icon    = config.icon;
  const iconCls = ICON_BG[resolvedCat] || ICON_BG.other;
  const vis     = VISIBILITY_BADGE[ticket.visibility || 'personal'];
  const VisIcon = vis.icon;

  const smartTitle = (ticket.origin && ticket.destination)
    ? `${ticket.origin} → ${ticket.destination}`
    : ticket.name;

  const dateStr    = ticket.date     ? format(new Date(ticket.date),     'd MMM yyyy', { locale: es }) : null;
  const endDateStr = ticket.end_date ? format(new Date(ticket.end_date), 'd MMM yyyy', { locale: es }) : null;
  const todayBadge = ticket.date && isToday(new Date(ticket.date));
  const contextCity = ticket.city || cityName || null;

  // ── Compact ───────────────────────────────────────────────────────────────
  if (compact) {
    return (
      <>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center gap-3 hover:shadow-md transition-all duration-200">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconCls}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{smartTitle}</p>
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {config.label}{dateStr ? ` · ${dateStr}` : ''}{contextCity ? ` · ${contextCity}` : ''}
            </p>
          </div>
          {ticket.file_url && (
            <button
              onClick={() => setViewingPDF(ticket.file_url)}
              className="px-3 py-1.5 rounded-lg bg-orange-700 hover:bg-orange-800 text-white text-xs font-semibold transition-all flex-shrink-0"
            >
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
      <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 border border-gray-100 p-5 flex gap-4">

        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 self-center ${iconCls}`}>
          <Icon className="w-6 h-6" />
        </div>

        {/* Text block */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">

          {/* Row 1: title */}
          <h3 className="font-bold text-gray-900 text-base leading-tight truncate pr-2">{smartTitle}</h3>

          {/* Row 2: subtitle = category label */}
          <p className="text-sm text-gray-500">{config.label}</p>

          {/* Row 3: date + city on same line */}
          {(dateStr || contextCity) && (
            <div className="flex items-center gap-3 flex-wrap mt-0.5">
              {dateStr && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="font-medium text-gray-600">
                    {dateStr}{endDateStr ? ` → ${endDateStr}` : ''}
                  </span>
                  {todayBadge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 font-bold text-[10px] uppercase tracking-wide">Hoy</span>
                  )}
                </span>
              )}
              {contextCity && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <MapPin className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                  <span className="font-medium text-orange-600">{contextCity}</span>
                </span>
              )}
            </div>
          )}

          {ticket.notes && (
            <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{ticket.notes}</p>
          )}

          {/* Row 4: visibility badge + edit/delete actions */}
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${vis.cls}`}>
              <VisIcon className="w-3 h-3" />
              {vis.label}
            </span>
            {/* Edit/Delete — visible on hover */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button onClick={() => onEdit(ticket)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-300 hover:text-gray-600 transition-colors" title="Editar">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button onClick={() => onDelete(ticket)}
                  className="p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors" title="Eliminar">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CTA — vertically centered */}
        <div className="flex-shrink-0 flex items-center self-center">
          {ticket.file_url ? (
            <button
              onClick={() => setViewingPDF(ticket.file_url)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-700 hover:bg-orange-800 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all whitespace-nowrap"
            >
              <FileText className="w-4 h-4" />
              Ver
            </button>
          ) : (
            <span className="text-xs text-gray-300 italic">Sin archivo</span>
          )}
        </div>

      </div>
      <PDFViewer fileUrl={viewingPDF} onClose={() => setViewingPDF(null)} />
    </>
  );
}