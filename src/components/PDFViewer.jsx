import { useEffect, useRef, useState } from 'react';
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PDFViewer({ fileUrl, onClose }) {
  const canvasRef = useRef(null);
  const [pdfDoc, setPdfDoc]       = useState(null);
  const [pageNum, setPageNum]     = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const isPDF = fileUrl?.toLowerCase().includes('.pdf');
  const isImg = fileUrl && /\.(jpe?g|png|webp|gif)(\?|$)/i.test(fileUrl);
  const fileName = fileUrl?.split('/').pop()?.split('?')[0] || 'documento';

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  useEffect(() => {
    if (!fileUrl || !isPDF) { setLoading(false); return; }
    const load = async () => {
      try {
        setLoading(true); setError(null);
        let lib = window['pdfjs-dist/build/pdf'];
        if (!lib) {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          document.head.appendChild(s);
          await new Promise((res, rej) => { s.onload = res; s.onerror = rej; });
          lib = window['pdfjs-dist/build/pdf'];
        }
        lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const pdf = await lib.getDocument(fileUrl).promise;
        setPdfDoc(pdf); setPageCount(pdf.numPages); setLoading(false);
      } catch { setError('No se pudo cargar el PDF'); setLoading(false); }
    };
    load();
  }, [fileUrl, isPDF]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    const render = async () => {
      const page = await pdfDoc.getPage(pageNum);
      const vp = page.getViewport({ scale: 1.8 });
      const canvas = canvasRef.current;
      canvas.height = vp.height; canvas.width = vp.width;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
    };
    render();
  }, [pdfDoc, pageNum]);

  if (!fileUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#1a1714' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 shrink-0" style={{ background: 'rgba(0,0,0,.5)' }}>
        <div className="w-8" />
        <p className="text-sm font-medium truncate max-w-xs" style={{ color: 'rgba(255,255,255,.75)' }}>{fileName}</p>
        <button onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: 'rgba(255,255,255,.1)' }}>
          <X className="w-5 h-5" style={{ color: 'rgba(255,255,255,.8)' }} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto flex items-start justify-center px-4 py-4">
        {loading && <p className="text-sm mt-8" style={{ color: 'rgba(255,255,255,.4)' }}>Cargando...</p>}
        {error && (
          <div className="text-center mt-8">
            <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,.4)' }}>{error}</p>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">Abrir en nueva pestaña</a>
          </div>
        )}
        {!loading && !error && isPDF && (
          <canvas ref={canvasRef} className="rounded-lg shadow-2xl" style={{ maxWidth: '100%' }} />
        )}
        {!loading && isImg && (
          <img src={fileUrl} alt={fileName} className="rounded-lg shadow-2xl object-contain"
            style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 140px)' }} />
        )}
        {!loading && !error && !isPDF && !isImg && (
          <div className="text-center mt-8">
            <p className="text-4xl mb-4">📄</p>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,.4)' }}>Vista previa no disponible</p>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white transition-colors"
              style={{ background: 'rgba(255,255,255,.12)' }}>
              <Download className="w-4 h-4" />Abrir archivo
            </a>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="shrink-0 px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(0,0,0,.5)' }}>
        <div className="flex items-center gap-2">
          {isPDF && pageCount > 1 && (
            <>
              <button onClick={() => setPageNum(p => Math.max(1, p - 1))} disabled={pageNum <= 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 transition-colors"
                style={{ background: 'rgba(255,255,255,.1)' }}>
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,.5)' }}>{pageNum} / {pageCount}</span>
              <button onClick={() => setPageNum(p => Math.min(pageCount, p + 1))} disabled={pageNum >= pageCount}
                className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 transition-colors"
                style={{ background: 'rgba(255,255,255,.1)' }}>
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </>
          )}
        </div>
        <a href={fileUrl} download target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white transition-colors"
          style={{ background: 'rgba(255,255,255,.12)' }}>
          <Download className="w-4 h-4" />Descargar
        </a>
      </div>
    </div>
  );
}
