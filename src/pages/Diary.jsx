import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BookOpen, Calendar, MapPin, Image as ImageIcon, Trash2, Upload, Mic, MicOff } from 'lucide-react';
import PhotoGallery from '@/components/diary/PhotoGallery';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const moods = ['😊', '😍', '😎', '🤔', '😴', '🤩', '😋'];

export default function Diary() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    content: '',
    location: '',
    mood: '😊',
    photos: [],
  });

  const queryClient = useQueryClient();
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);

  const { data: entries = [] } = useQuery({
    queryKey: ['diaryEntries'],
    queryFn: () => base44.entities.DiaryEntry.list('-date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.DiaryEntry.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diaryEntries'] });
      setDialogOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        title: '',
        content: '',
        location: '',
        mood: '😊',
        photos: [],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DiaryEntry.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['diaryEntries'] }),
  });

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
      photos: formData.photos.filter((_, i) => i !== index),
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
          setFormData(prev => ({
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
    <div className="min-h-screen bg-gradient-to-b from-white via-amber-50/30 to-white">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-stone-900 mb-2">Diario de Viaje 📔</h1>
              <p className="text-stone-600">Recuerdos y momentos especiales</p>
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-stone-900 hover:bg-stone-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Entrada
            </Button>
          </div>
        </div>
      </div>

      {/* Entries */}
      <div className="max-w-4xl mx-auto px-6 py-8 pb-24">
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="list">Lista</TabsTrigger>
            <TabsTrigger value="photos" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              Galería de fotos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            {entries.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-stone-200 rounded-2xl">
            <BookOpen className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-400">Empieza a escribir tu diario de viaje</p>
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white border-2 border-stone-200 rounded-2xl overflow-hidden hover:border-stone-300 transition-all"
              >
                {/* Photos */}
                {entry.photos && entry.photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 bg-stone-50">
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
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{entry.mood || '😊'}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-stone-400" />
                          <span className="text-sm font-medium text-stone-600">
                            {format(new Date(entry.date), 'EEEE, d MMMM yyyy', { locale: es })}
                          </span>
                        </div>
                        {entry.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-stone-400" />
                            <span className="text-sm text-stone-500">{entry.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(entry.id)}
                      className="text-stone-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {entry.title && (
                    <h2 className="text-2xl font-bold text-stone-900 mb-3">{entry.title}</h2>
                  )}
                  <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                </div>
              </div>
            ))}
          </div>
            )}
          </TabsContent>

          <TabsContent value="photos">
            <PhotoGallery entries={entries} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva entrada del diario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-stone-700 mb-1.5 block">Fecha</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700 mb-1.5 block">Estado de ánimo</label>
                <Select value={formData.mood} onValueChange={(v) => setFormData({ ...formData, mood: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {moods.map((mood) => (
                      <SelectItem key={mood} value={mood}>
                        <span className="text-2xl">{mood}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">Título (opcional)</label>
              <Input
                placeholder="ej. Primer día en Tokio"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">Ubicación (opcional)</label>
              <Input
                placeholder="ej. Shibuya, Tokio"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">¿Qué pasó hoy?</label>
              <Textarea
                placeholder="Escribe sobre tu día..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">Fotos</label>
              <div className="space-y-3">
                {formData.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {formData.photos.map((photo, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                        <img src={photo} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removePhoto(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-stone-300 rounded-lg hover:border-stone-400 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                  {uploadingPhoto ? (
                    <>Subiendo...</>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-stone-500" />
                      <span className="text-sm text-stone-600">Subir foto</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-stone-900 hover:bg-stone-800"
                disabled={!formData.content.trim() || createMutation.isPending}
              >
                {createMutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}