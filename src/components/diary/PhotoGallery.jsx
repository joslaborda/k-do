import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PhotoGallery({ entries }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const allPhotos = entries.flatMap(entry => 
    (entry.photos || []).map(photo => ({
      url: photo,
      entry: entry,
      date: entry.date,
      title: entry.title,
      location: entry.location
    }))
  );

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1));
    setSelectedPhoto(allPhotos[currentIndex - 1] || allPhotos[allPhotos.length - 1]);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0));
    setSelectedPhoto(allPhotos[currentIndex + 1] || allPhotos[0]);
  };

  if (allPhotos.length === 0) {
    return (
      <div className="text-center py-24 border-2 border-dashed border-stone-200 rounded-2xl">
        <div className="text-6xl mb-6 opacity-20">📸</div>
        <p className="text-stone-400">No hay fotos aún</p>
        <p className="text-sm text-stone-400 mt-2">Añade fotos a tus entradas del diario</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {allPhotos.map((photo, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedPhoto(photo);
              setCurrentIndex(idx);
            }}
            className="group relative aspect-square overflow-hidden rounded-xl border-2 border-stone-200 hover:border-red-400 transition-all"
          >
            <img
              src={photo.url}
              alt={photo.title || 'Foto del viaje'}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <p className="text-sm font-medium truncate">{photo.title || 'Sin título'}</p>
                {photo.date && (
                  <p className="text-xs opacity-90 flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(photo.date), 'd MMM', { locale: es })}
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden">
          <div className="relative bg-black">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {allPhotos.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <img
              src={selectedPhoto?.url}
              alt={selectedPhoto?.title || 'Foto'}
              className="w-full max-h-[80vh] object-contain"
            />

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
              <h3 className="text-xl font-bold mb-1">{selectedPhoto?.title || 'Sin título'}</h3>
              <div className="flex items-center gap-4 text-sm opacity-90">
                {selectedPhoto?.date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(selectedPhoto.date), 'd MMMM yyyy', { locale: es })}
                  </span>
                )}
                {selectedPhoto?.location && (
                  <span>📍 {selectedPhoto.location}</span>
                )}
              </div>
              {allPhotos.length > 1 && (
                <p className="text-xs mt-2 opacity-75">
                  {currentIndex + 1} de {allPhotos.length}
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}