import { useState } from 'react';
import { Eye, EyeOff, Users, Pencil, Trash2, MapPin, CalendarDays, FileText, ExternalLink } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import PDFViewer from '@/components/PDFViewer';
import { CATEGORY_CONFIG } from './DocumentForm';

const VISIBILITY_BADGE = {
  personal:       { label: 'Solo yo',   icon: EyeOff, cls: 'bg-slate-100 text-slate-500' },
  shared:         { label: 'Grupo',      icon: Eye,    cls: 'bg-green-100 text-green-700' },
  selected_users: { label: 'Compartido', icon: Users,  cls: 'bg-blue-100 text-blue-700' },
};

// Larger icon bg colors per category
const ICON_BG = {
  flight:   'bg-blue-100 text-blue-600',
  train:    'bg-emerald-100 text-emerald-600',
  hotel:    'bg-purple-100 text-purple-600',
  event:    'bg-orange-100 text-orange-600',
  personal: 'bg-slate-100 text-slate-600',
  other:    'bg-gray-100 text-gray-500',
};

export default function DocumentCard({ ticket, onEdit, onDelete, compact = false, cityName = '', dayTitle = '' }) {
  const [viewingPDF, setViewingPDF] = useState(null);

  const config = CATEGORY_CONFIG[ticket.category] || CATEGORY_CONFIG.other;
  const Icon = config.icon;
  const iconCls = ICON_BG[ticket.category] || ICON_BG.other;
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

  const isDateToday = ticket.date ? isToday(new Date(ticket.date)) : false;

  const contextCity = ticket.city || cityName || null;
  const contextDay = dayTitle || null;

  // ── Compact variant (inside CityTickets / DayDocuments) ──────────────────
  if (compact) {
    return (
      <>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center gap-3 hover:shadow-md transition-all">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconCls}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">{smartTitle}</p>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
              <span>{config.label}</span>
              {dateStr && <span>· {dateStr}</span>}
              {contextCity && <span>· {contextCity}</span>}
            </div>
          </div>
          {ticket.file_url && (
            <button
              onClick={() => setViewingPDF(ticket.file_url)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-700 hover:bg-orange-800 text-white text-xs font-semibold transition-colors flex-shrink-0 shadow-sm"
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

  // ── Full card — horizontal layout ─────────────────────────────────────────
  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 p-5">
        <div className="flex gap-4">

          {/* LEFT — big category icon */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconCls}`}>
            <Icon className="w-7 h-7" />
          </div>

          {/* RIGHT — all content */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">

            {/* Top row: title + action icons */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                {/* 1. Title */}
                <h3 className="font-extrabold text-gray-900 text-base leading-tight tracking-tight truncate">
                  {smartTitle}
                </h3>
                {/* 2. Subtitle — doc type */}
                <p className="text-sm text-gray-400 font-medium mt-0.5">{config.label}</p>
              </div>
              {/* Action icons */}
              <div className="flex items-center gap-0.5 flex-shrink-0 opacity-30 hover:opacity-100 transition-opacity mt-0.5">
                {onEdit && (
                  <button
                    onClick={() => onEdit(ticket)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(ticket)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 3. Meta info row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
              {dateStr && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span className="font-medium text-gray-600">{dateStr}</span>
                  {endDateStr && <><span className="text-gray-300">→</span><span className="font-medium text-gray-600">{endDateStr}</span></>}
                  {isDateToday && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold text-[10px] uppercase tracking-wide">Hoy</span>
                  )}
                </span>
              )}
              {contextCity && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  <span className="font-medium text-gray-600">{contextCity}</span>
                </span>
              )}
              {contextDay && (
                <span className="font-medium text-orange-600">{contextDay}</span>
              )}
            </div>

            {/* Notes */}
            {ticket.notes && (
              <p className="text-xs text-gray-400 leading-relaxed line-clamp-1">{ticket.notes}</p>
            )}

            {/* 4. Footer: visibility badge + CTA */}
            <div className="flex items-center justify-between gap-2 pt-2 mt-auto">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${vis.cls}`}>
                <VisIcon className="w-3 h-3" />
                {vis.label}
              </span>
              {ticket.file_url ? (
                <button
                  onClick={() => setViewingPDF(ticket.file_url)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-700 hover:bg-orange-800 text-white text-xs font-bold shadow-sm hover:shadow-md transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Ver documento
                </button>
              ) : (
                <span className="text-xs text-gray-300 italic">Sin archivo</span>
              )}
            </div>

          </div>
        </div>
      </div>
      <PDFViewer fileUrl={viewingPDF} onClose={() => setViewingPDF(null)} />
    </>
  );
}