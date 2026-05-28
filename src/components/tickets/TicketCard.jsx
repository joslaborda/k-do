import { useState } from 'react';
import { format } from 'date-fns';
import { Train, Hotel, Shield, Ticket, MoreVertical, Trash2, FileText, Eye, X, Loader2 } from 'lucide-react';
import { PlaneIcon } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Document, Page, pdfjs } from 'react-pdf';
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

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const categoryConfig = {
  flight: { icon: PlaneIcon, color: 'bg-indigo-900/30 text-indigo-400 border border-indigo-700/50', label: 'Vuelo' },
  train: { icon: Train, color: 'bg-emerald-900/30 text-emerald-400 border border-emerald-700/50', label: 'Tren' },
  hotel: { icon: Hotel, color: 'bg-purple-900/30 text-purple-400 border border-purple-700/50', label: 'Hotel' },
  freetour: { icon: FileText, color: 'bg-orange-900/30 text-orange-400 border border-orange-700/50', label: 'Free Tour' },
  insurance: { icon: Shield, color: 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/50', label: 'Seguro' },
  personal: { icon: FileText, color: 'bg-blue-900/30 text-blue-400 border border-blue-700/50', label: 'Documentos Personales' }
};

export default function TicketCard({ ticket, onDelete }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const config = categoryConfig[ticket.category] || categoryConfig.other;
  const Icon = config.icon;
  const isPDF = ticket.file_url?.toLowerCase().endsWith('.pdf');

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  return (
    <>
      <div className="group bg-card rounded-xl border border-border p-5 hover:border-primary/30 transition-all duration-300">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate text-sm">{ticket.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">{config.label}</p>
            {ticket.date && (
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(ticket.date), 'd MMM, yyyy')}
              </p>
            )}
            {ticket.notes && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{ticket.notes}</p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              {ticket.file_url && (
                <DropdownMenuItem onClick={() => setViewerOpen(true)} className="text-foreground focus:bg-secondary">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver documento
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDelete(ticket.id)} className="text-red-400 focus:bg-secondary">
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
            <DialogTitle className="text-foreground">{ticket.name}</DialogTitle>
            <button onClick={() => setViewerOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </DialogHeader>
          
          <div className="mt-4 bg-stone-900 rounded-lg overflow-hidden h-[70vh] flex flex-col">
           {isPDF ? (
             <>
               {isLoading && (
                 <div className="flex-1 flex items-center justify-center">
                   <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                 </div>
               )}
               <div className="flex-1 overflow-auto">
                 <Document 
                   file={ticket.file_url}
                   onLoadSuccess={onDocumentLoadSuccess}
                   onLoadStart={() => setIsLoading(true)}
                   loading={<div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 text-muted-foreground animate-spin" /></div>}
                 >
                   <Page 
                     pageNumber={currentPage}
                     width={Math.min(window.innerWidth - 80, 800)}
                     renderTextLayer={false}
                   />
                 </Document>
               </div>
               {numPages && numPages > 1 && (
                 <div className="flex items-center justify-between px-4 py-3 bg-stone-800 border-t border-stone-700">
                   <Button
                     onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                     disabled={currentPage === 1}
                     variant="ghost"
                     size="sm"
                     className="text-muted-foreground hover:text-foreground"
                   >
                     ← Anterior
                   </Button>
                   <span className="text-xs text-muted-foreground">
                     Página {currentPage} de {numPages}
                   </span>
                   <Button
                     onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                     disabled={currentPage === numPages}
                     variant="ghost"
                     size="sm"
                     className="text-muted-foreground hover:text-foreground"
                   >
                     Siguiente →
                   </Button>
                 </div>
               )}
             </>
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