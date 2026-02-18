import { useState, useImperativeHandle, forwardRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote, Plus, Trash2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const QuickNotes = forwardRef((props, ref) => {
  const [open, setOpen] = useState(false);
  const [noteText, setNoteText] = useState('');

  const queryClient = useQueryClient();

  const { data: notes = [] } = useQuery({
    queryKey: ['quickNotes'],
    queryFn: async () => {
      // Usar UsefulInfo con categoría especial para notas rápidas
      const allInfo = await base44.entities.UsefulInfo.list();
      return allInfo.filter(i => i.category === 'otros' && i.title === '__quick_note__');
    },
  });

  const createMutation = useMutation({
    mutationFn: (text) => base44.entities.UsefulInfo.create({
      title: '__quick_note__',
      category: 'otros',
      content: text,
      icon: '📝'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quickNotes'] });
      setNoteText('');
      setOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.UsefulInfo.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quickNotes'] }),
  });

  useImperativeHandle(ref, () => ({
    openNotes: () => setOpen(true)
  }));

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-6 md:bottom-6 md:right-6 w-14 h-14 bg-yellow-400 hover:bg-yellow-500 rounded-full shadow-lg flex items-center justify-center text-white transition-all hover:scale-110 z-40"
      >
        <StickyNote className="w-6 h-6" />
      </button>

      {/* Notes Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-yellow-500" />
              Notas Rápidas
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Add new note */}
            <div className="space-y-2">
              <Textarea
                placeholder="Escribe una nota rápida..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={3}
                className="border-yellow-200 focus:border-yellow-400"
              />
              <Button
                onClick={() => createMutation.mutate(noteText)}
                disabled={!noteText.trim() || createMutation.isPending}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-stone-900"
              >
                <Plus className="w-4 h-4 mr-2" />
                {createMutation.isPending ? 'Guardando...' : 'Añadir nota'}
              </Button>
            </div>

            {/* Notes list */}
            <div className="space-y-2 pt-4 border-t">
              {notes.length === 0 ? (
                <div className="text-center py-8 text-stone-400">
                  <StickyNote className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No tienes notas aún</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 relative group"
                    >
                      <button
                        onClick={() => deleteMutation.mutate(note.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-stone-500 hover:text-red-600" />
                      </button>
                      <p className="text-sm text-stone-700 whitespace-pre-wrap pr-6">
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

QuickNotes.displayName = 'QuickNotes';

export default QuickNotes;