import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, X } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function TicketQuickViewer({ ticket, open, onOpenChange }) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const isPDF = ticket?.file_url?.toLowerCase().endsWith('.pdf');

  if (!ticket) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-stone-800 border-stone-700 max-w-4xl max-h-[90vh]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-stone-100 truncate pr-8">{ticket.name}</DialogTitle>
        </DialogHeader>
        <div className="mt-2 bg-stone-900 rounded-lg overflow-hidden h-[70vh] flex flex-col">
          {isPDF ? (
            <>
              <div className="flex-1 overflow-auto">
                <Document
                  file={ticket.file_url}
                  onLoadSuccess={({ numPages }) => { setNumPages(numPages); setCurrentPage(1); }}
                  loading={<div className="flex items-center justify-center h-40"><Loader2 className="w-8 h-8 text-stone-400 animate-spin" /></div>}
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
                  <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} variant="ghost" size="sm" className="text-stone-400 hover:text-stone-200">← Anterior</Button>
                  <span className="text-xs text-stone-400">Página {currentPage} de {numPages}</span>
                  <Button onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))} disabled={currentPage === numPages} variant="ghost" size="sm" className="text-stone-400 hover:text-stone-200">Siguiente →</Button>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <img src={ticket.file_url} alt={ticket.name} className="max-w-full max-h-full object-contain" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}