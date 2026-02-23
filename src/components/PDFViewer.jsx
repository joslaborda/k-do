import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer({ fileUrl, onClose }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error) {
    console.error('Error loading PDF:', error);
    setLoading(false);
  }

  const isPDF = fileUrl?.toLowerCase().endsWith('.pdf');

  return (
    <Dialog open={!!fileUrl} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Documento</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a href={fileUrl} download target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </a>
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-auto bg-gray-100 flex items-center justify-center p-4" style={{ height: 'calc(90vh - 120px)' }}>
          {isPDF ? (
            <div className="bg-white shadow-lg">
              {loading && (
                <div className="flex items-center justify-center h-96">
                  <div className="animate-pulse text-muted-foreground">Cargando PDF...</div>
                </div>
              )}
              <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={null}
              >
                <Page 
                  pageNumber={pageNumber} 
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  width={Math.min(window.innerWidth * 0.8, 800)}
                />
              </Document>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <img src={fileUrl} alt="Documento" className="max-w-full max-h-full" />
            </div>
          )}
        </div>

        {isPDF && numPages && (
          <div className="flex items-center justify-between p-4 border-t bg-white">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {pageNumber} de {numPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
              disabled={pageNumber >= numPages}
            >
              Siguiente
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}