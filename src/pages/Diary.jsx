import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { usePullToRefresh } from '@/components/hooks/usePullToRefresh';
import { useUndo } from '@/components/hooks/useUndo';
import PullToRefreshIndicator from '@/components/PullToRefreshIndicator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BookOpen, Calendar, MapPin, Image as ImageIcon, Trash2, Upload, Mic, MicOff } from 'lucide-react';
import PhotoGallery from '@/components/diary/PhotoGallery';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle } from
'@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const moods = ['😊', '😍', '😎', '🤔', '😴', '🤩', '😋'];

export default function Diary() {
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('trip_id');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    content: '',
    location: '',
    mood: '😊',
    photos: []
  });

  const queryClient = useQueryClient();
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);
  const { performDelete } = useUndo();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['diaryEntries'] });
  };

  const { isPulling, pullDistance } = usePullToRefresh(handleRefresh);

  const { data: entries = [] } = useQuery({
    queryKey: ['diaryEntries', tripId],
    queryFn: () => base44.entities.DiaryEntry.filter({ trip_id: tripId }, '-date'),
    enabled: !!tripId,
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.DiaryEntry.create({
      ...data,
      trip_id: tripId
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diaryEntries'] });
      setDialogOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        title: '',
        content: '',
        location: '',
        mood: '😊',
        photos: []
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DiaryEntry.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['diaryEntries'] })
  });

  const handleDelete = async (entry) => {
    const entryData = { ...entry };
    delete entryData.id;
    delete entryData.created_date;
    delete entryData.updated_date;
    delete entryData.created_by;

    await performDelete(
      () => deleteMutation.mutateAsync(entry.id),
      () => base44.entities.DiaryEntry.create(entryData),
      entry.title || 'Entrada del diario'
    );
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, photos: [...formData.photos, file_url] });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = (index) => {
    setFormData({
      ...formData,
      photos: formData.photos.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = () => {
    createMutation.mutate(formData);
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setFormData((prev) => ({
            ...prev,
            content: prev.content + finalTranscript
          }));
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Error de reconocimiento:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        if (isRecording) {
          recognitionRef.current.start();
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Tu navegador no soporta reconocimiento de voz. Prueba con Chrome o Edge.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50">
      <PullToRefreshIndicator isPulling={isPulling} pullDistance={pullDistance} />
      
      {/* Header con caja naranja */}
      <div className="bg-orange-700 pt-12 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div>
            <h1 className="text-white text-4xl font-bold">Diario de Viaje 📔</h1>
            <p className="text-white/90 mt-2">Recuerdos y momentos especiales</p>
          </div>
        </div>
      </div>

      {/* Entries */}
      <div className="bg-orange-50 mx-auto px-6 pt-6 pb-12 md:pb-6 max-w-4xl -mt-12">
        <div className="flex justify-end mb-6">
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Entrada
          </Button>
        </div>
        <div>
          <Tabs defaultValue="list" className="mb-6">
            <TabsList className="bg-white border border-border p-1">
              <TabsTrigger value="list" className="data-[state=active]:bg-orange-700 data-[state=active]:text-white">
                📋 Lista
              </TabsTrigger>
              <TabsTrigger value="photos" className="data-[state=active]:bg-orange-700 data-[state=active]:text-white gap-2">
                🖼️ Galería
              </TabsTrigger>
            </TabsList>

          <TabsContent value="list">
            {entries.length === 0 ?
            <div className="bg-[#ffffff] py-24 text-center rounded-2xl border-2 border-dashed border-border glass">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Empieza a escribir tu diario de viaje</p>
          </div> :

            <div className="space-y-6">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="glass border-2 border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all">

                  {/* Photos */}
                  {entry.photos && entry.photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 bg-secondary/30">
                      {entry.photos.map((photo, idx) => (
                        <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                          <img
                            src={photo}
                            alt={`Foto ${idx + 1}`}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-5xl flex-shrink-0">{entry.mood || '😊'}</div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm font-medium text-foreground truncate">
                              {format(new Date(entry.date), 'EEEE, d MMMM yyyy', { locale: es })}
                            </span>
                          </div>
                          {entry.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm text-muted-foreground truncate">{entry.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(entry)}
                        className="text-muted-foreground hover:text-destructive hover:bg-secondary flex-shrink-0 ml-2"
                        aria-label="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {entry.title && (
                      <h2 className="text-2xl font-bold text-foreground mb-3">{entry.title}</h2>
                    )}
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                  </div>
                </div>
              ))}
            </div>
                  }
                  </TabsContent>

          <TabsContent value="photos">
            <PhotoGallery entries={entries} />
          </TabsContent>
          </Tabs>
          </div>
          </div>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Nueva entrada del diario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-input border-border text-foreground" />

              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Estado de ánimo</label>
                <Select value={formData.mood} onValueChange={(v) => setFormData({ ...formData, mood: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {moods.map((mood) =>
                    <SelectItem key={mood} value={mood}>
                        <span className="text-2xl">{mood}</span>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Título (opcional)</label>
              <Input
                placeholder="ej. Primer día en Tokio"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground" />

            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Ubicación (opcional)</label>
              <Input
                placeholder="ej. Shibuya, Tokio"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground" />

            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-foreground">¿Qué pasó hoy?</label>
                <Button
                  type="button"
                  variant={isRecording ? "destructive" : "outline"}
                  size="sm"
                  onClick={toggleRecording}
                  className="gap-2">

                  {isRecording ?
                  <>
                      <MicOff className="w-4 h-4" />
                      Detener dictado
                    </> :

                  <>
                      <Mic className="w-4 h-4" />
                      Dictar
                    </>
                  }
                </Button>
              </div>
              <Textarea
                ref={textareaRef}
                placeholder="Escribe o dicta sobre tu día..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className={`bg-input border-border text-foreground placeholder:text-muted-foreground ${isRecording ? 'ring-2 ring-red-500' : ''}`} />

              {isRecording &&
              <p className="text-xs text-red-400 mt-1 animate-pulse">🎤 Escuchando...</p>
              }
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Fotos</label>
              <div className="space-y-3">
                {formData.photos.length > 0 &&
                <div className="grid grid-cols-3 gap-2">
                    {formData.photos.map((photo, idx) =>
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                        <img src={photo} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">

                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                  )}
                  </div>
                }
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg hover:border-primary/50 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto} />

                  {uploadingPhoto ?
                  <>Subiendo...</> :

                  <>
                      <Upload className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Subir foto</span>
                    </>
                  }
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border text-foreground hover:bg-secondary">
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-primary hover:bg-primary/90"
                disabled={!formData.content.trim() || createMutation.isPending}>

                {createMutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>);

}