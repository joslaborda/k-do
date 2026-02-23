import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X, ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function PDFViewer({ fileUrl, onClose }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error) {
    console.error('Error loading PDF:', error);
    setLoading(false);
    setError('No se pudo cargar el PDF');
  }

  const isPDF = fileUrl?.toLowerCase().endsWith('.pdf');

  return (
    <Dialog open={!!fileUrl} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Documento</h3>
            {numPages && <span className="text-sm text-muted-foreground">({numPages} {numPages === 1 ? 'página' : 'páginas'})</span>}
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

        <div className="bg-gray-100 flex flex-col items-center justify-center p-4" style={{ height: 'calc(90vh - 120px)' }}>
          {isPDF ? (
            <>
              {loading && (
                <div className="flex items-center justify-center h-96">
                  <div className="animate-pulse text-muted-foreground">Cargando PDF...</div>
                </div>
              )}
              {error && (
                <div className="flex flex-col items-center justify-center h-96 gap-4">
                  <div className="text-red-600">{error}</div>
                  <Button onClick={() => window.open(fileUrl, '_blank')}>
                    Abrir en nueva pestaña
                  </Button>
                </div>
              )}
              {!loading && !error && (
                <div className="bg-white shadow-lg">
                  <Document
                    file={fileUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading=""
                    options={{
                      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
                      cMapPacked: true,
                      standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
                    }}
                  >
                    <Page 
                      pageNumber={pageNumber}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      width={Math.min(window.innerWidth * 0.75, 700)}
                    />
                  </Document>
                </div>
              )}
            </>
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