import { format } from 'date-fns';
import { Plane, Train, Hotel, Shield, Ticket, MoreVertical, Download, Trash2, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const categoryConfig = {
  flight: { icon: Plane, color: 'bg-sky-50 text-sky-600', label: 'Vuelo' },
  train: { icon: Train, color: 'bg-emerald-50 text-emerald-600', label: 'Tren' },
  hotel: { icon: Hotel, color: 'bg-violet-50 text-violet-600', label: 'Hotel' },
  freetour: { icon: FileText, color: 'bg-rose-50 text-rose-600', label: 'Free Tour' },
  insurance: { icon: Shield, color: 'bg-amber-50 text-amber-600', label: 'Seguro' }
};

export default function TicketCard({ ticket, onDelete }) {
  const config = categoryConfig[ticket.category] || categoryConfig.other;
  const Icon = config.icon;

  return (
    <div className="group bg-white rounded-xl border border-slate-100 p-4 hover:shadow-lg hover:border-slate-200 transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-900 truncate">{ticket.name}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{config.label}</p>
          {ticket.date && (
            <p className="text-xs text-slate-400 mt-1">
              {format(new Date(ticket.date), 'MMM d, yyyy')}
            </p>
          )}
          {ticket.notes && (
            <p className="text-sm text-slate-500 mt-2 line-clamp-2">{ticket.notes}</p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {ticket.file_url && (
              <DropdownMenuItem asChild>
                <a href={ticket.file_url} target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onDelete(ticket.id)} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {ticket.file_url && (
        <div className="mt-3 flex items-center gap-2">
          <a 
            href={ticket.file_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 text-sm text-stone-700 bg-stone-50 hover:bg-stone-100 py-2 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Ver
          </a>
          <a 
            href={ticket.file_url} 
            download
            className="flex-1 flex items-center justify-center gap-2 text-sm text-stone-700 bg-stone-50 hover:bg-stone-100 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Descargar
          </a>
        </div>
      )}
    </div>
  );
}