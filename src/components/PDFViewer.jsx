import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer({ fileUrl, onClose }) {
  const [numPages, setNumPages] = useState(null);
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

        <div className="overflow-auto bg-gray-100 p-4" style={{ height: 'calc(90vh - 64px)' }}>
          {isPDF ? (
            <div className="flex flex-col items-center gap-4">
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
                {Array.from(new Array(numPages), (el, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    width={Math.min(window.innerWidth * 0.8, 800)}
                    className="mb-4 shadow-lg"
                  />
                ))}
              </Document>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <img src={fileUrl} alt="Documento" className="max-w-full max-h-full" />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}