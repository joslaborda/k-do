import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X, ExternalLink } from 'lucide-react';

export default function PDFViewer({ fileUrl, onClose }) {
  if (!fileUrl) return null;

  const isPDF = fileUrl?.toLowerCase().endsWith('.pdf');

  return (
    <Dialog open={!!fileUrl} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <h3 className="font-semibold text-foreground">Documento</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(fileUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir en nueva pestaña
            </Button>
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

        <div className="bg-gray-100" style={{ height: 'calc(95vh - 64px)' }}>
          {isPDF ? (
            <iframe
              src={fileUrl}
              className="w-full h-full"
              title="PDF Viewer"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <img src={fileUrl} alt="Documento" className="max-w-full max-h-full object-contain" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}