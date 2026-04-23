import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PDFViewer({ fileUrl, onClose }) {
  const canvasRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!fileUrl) return;

    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load PDF.js
        let pdfjsLib = window['pdfjs-dist/build/pdf'];
        
        if (!pdfjsLib) {
          // Dynamically load PDF.js
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          script.async = true;
          document.head.appendChild(script);
          
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
          });
          
          pdfjsLib = window['pdfjs-dist/build/pdf'];
        }

        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const pdf = await pdfjsLib.getDocument(fileUrl).promise;
        setPdfDoc(pdf);
        setPageCount(pdf.numPages);
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Error al cargar el PDF');
        setLoading(false);
      }
    };

    loadPDF();
  }, [fileUrl]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.error('Error rendering page:', err);
      }
    };

    renderPage();
  }, [pdfDoc, pageNum]);

  if (!fileUrl) return null;

  const isPDF = fileUrl?.toLowerCase().endsWith('.pdf');

  return (
    <Dialog open={!!fileUrl} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-white pr-12">
          <DialogTitle className="font-semibold text-foreground">Documento</DialogTitle>
          <div className="flex items-center gap-2">
            {isPDF && pageCount > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPageNum(Math.max(1, pageNum - 1))}
                  disabled={pageNum <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm">
                  {pageNum} / {pageCount}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPageNum(Math.min(pageCount, pageNum + 1))}
                  disabled={pageNum >= pageCount}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
            <Button variant="outline" size="sm" asChild>
              <a href={fileUrl} download target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </a>
            </Button>
          </div>
        </div>

        <div className="bg-gray-100 overflow-auto flex items-center justify-center" style={{ height: 'calc(95vh - 64px)' }}>
          {isPDF ? (
            <>
              {loading && <div className="text-center py-8">Cargando PDF...</div>}
              {error && <div className="text-center py-8 text-red-500">{error}</div>}
              <canvas ref={canvasRef} className="max-w-full" />
            </>
          ) : (
            <div className="flex items-center justify-center h-full p-4">
              <img src={fileUrl} alt="Documento" className="max-w-full max-h-full object-contain" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}