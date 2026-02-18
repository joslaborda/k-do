import { useState } from 'react';
import { format } from 'date-fns';
import { Plane, Train, Hotel, Shield, Ticket, MoreVertical, Trash2, FileText, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const categoryConfig = {
  flight: { icon: Plane, color: 'bg-indigo-900/30 text-indigo-400 border border-indigo-700/50', label: 'Vuelo' },
  train: { icon: Train, color: 'bg-emerald-900/30 text-emerald-400 border border-emerald-700/50', label: 'Tren' },
  hotel: { icon: Hotel, color: 'bg-purple-900/30 text-purple-400 border border-purple-700/50', label: 'Hotel' },
  freetour: { icon: FileText, color: 'bg-orange-900/30 text-orange-400 border border-orange-700/50', label: 'Free Tour' },
  insurance: { icon: Shield, color: 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/50', label: 'Seguro' }
};

export default function TicketCard({ ticket, onDelete }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const config = categoryConfig[ticket.category] || categoryConfig.other;
  const Icon = config.icon;
  const isPDF = ticket.file_url?.toLowerCase().endsWith('.pdf');

  return (
    <>
      <div className="group bg-stone-800/40 backdrop-blur rounded-xl border border-stone-700 p-5 hover:border-stone-600 transition-all duration-300">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-stone-100 truncate text-sm">{ticket.name}</h3>
            <p className="text-xs text-stone-400 mt-1">{config.label}</p>
            {ticket.date && (
              <p className="text-xs text-stone-500 mt-1">
                {format(new Date(ticket.date), 'd MMM, yyyy')}
              </p>
            )}
            {ticket.notes && (
              <p className="text-xs text-stone-400 mt-2 line-clamp-2">{ticket.notes}</p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-stone-400 hover:text-stone-200">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-stone-800 border-stone-700">
              {ticket.file_url && (
                <DropdownMenuItem onClick={() => setViewerOpen(true)} className="text-stone-200 focus:bg-stone-700">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver documento
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDelete(ticket.id)} className="text-red-400 focus:bg-stone-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {ticket.file_url && (
          <div className="mt-4">
            <button 
              onClick={() => setViewerOpen(true)}
              className="w-full flex items-center justify-center gap-2 text-xs font-medium text-indigo-400 bg-indigo-900/20 hover:bg-indigo-900/30 border border-indigo-700/30 py-2.5 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              Ver documento
            </button>
          </div>
        )}
      </div>

      {/* File Viewer Modal */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="bg-stone-800 border-stone-700 max-w-4xl max-h-[90vh]">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-stone-100">{ticket.name}</DialogTitle>
            <button onClick={() => setViewerOpen(false)} className="text-stone-400 hover:text-stone-200">
              <X className="w-5 h-5" />
            </button>
          </DialogHeader>
          
          <div className="mt-4 bg-stone-900 rounded-lg overflow-hidden h-[70vh]">
           {isPDF ? (
             <iframe
               src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(ticket.file_url)}`}
               className="w-full h-full border-0"
               title={ticket.name}
               allow="fullscreen"
             />
           ) : (
             <div className="w-full h-full flex items-center justify-center bg-stone-900">
               <img 
                 src={ticket.file_url} 
                 alt={ticket.name}
                 className="max-w-full max-h-full object-contain"
               />
             </div>
           )}
           </div>
        </DialogContent>
      </Dialog>
    </>
  );
}