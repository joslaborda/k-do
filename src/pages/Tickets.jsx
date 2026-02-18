import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Plane, Train, Hotel, Shield, FileText, Upload, Loader2, CheckSquare, Square, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import TicketCard from '@/components/tickets/TicketCard';

const categories = [
  { value: 'flight', label: 'Vuelos', icon: Plane },
  { value: 'train', label: 'Trenes', icon: Train },
  { value: 'hotel', label: 'Hoteles', icon: Hotel },
  { value: 'freetour', label: 'Free Tours', icon: FileText },
  { value: 'insurance', label: 'Seguro', icon: Shield },
];

export default function Tickets() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [newTodoText, setNewTodoText] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'flight',
    date: '',
    notes: '',
    file_url: ''
  });

  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => base44.entities.Ticket.list('-date'),
  });

  const { data: todos = [], isLoading: todosLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: () => base44.entities.TodoItem.list('order'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Ticket.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setDialogOpen(false);
      setFormData({ name: '', category: 'flight', date: '', notes: '', file_url: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Ticket.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
  });

  const createTodoMutation = useMutation({
    mutationFn: (data) => base44.entities.TodoItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setNewTodoText('');
    },
  });

  const updateTodoMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TodoItem.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  });

  const deleteTodoMutation = useMutation({
    mutationFn: (id) => base44.entities.TodoItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData({ ...formData, file_url });
    setUploading(false);
  };

  const filteredTickets = activeTab === 'all' || activeTab === 'checklist'
    ? tickets 
    : tickets.filter(t => t.category === activeTab);

  const handleAddTodo = () => {
    if (!newTodoText.trim()) return;
    createTodoMutation.mutate({
      text: newTodoText,
      completed: false,
      order: todos.length
    });
  };

  const toggleTodo = (todo) => {
    updateTodoMutation.mutate({
      id: todo.id,
      data: { ...todo, completed: !todo.completed }
    });
  };

  const getCategoryCount = (category) => {
    return tickets.filter(t => t.category === category).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-900/95 to-stone-950">
      <div className="max-w-4xl mx-auto px-6 py-12 pb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-stone-100">Documentación ✈️</h1>
            <p className="text-stone-400 mt-2">Documentos de viaje y checklist</p>
          </div>
          {activeTab !== 'checklist' && (
            <Button onClick={() => setDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Añadir
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-stone-800 border border-stone-700 p-1 h-auto flex-wrap gap-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-stone-400 data-[state=active]:text-white">
              Todos ({tickets.length})
            </TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger 
                key={cat.value} 
                value={cat.value}
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-stone-400 data-[state=active]:text-white"
              >
                <cat.icon className="w-4 h-4 mr-1" />
                {cat.label}
              </TabsTrigger>
            ))}
            <TabsTrigger 
              value="checklist"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-stone-400 data-[state=active]:text-white"
            >
              <CheckSquare className="w-4 h-4 mr-1" />
              Checklist
            </TabsTrigger>
          </TabsList>

          <TabsContent value="checklist">
            <div className="bg-stone-800/40 backdrop-blur-xl rounded-2xl border border-stone-700 p-6">
              <div className="flex gap-2 mb-6">
                <Input
                  placeholder="Añadir nueva tarea..."
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
                  className="flex-1 bg-stone-700/50 border-stone-600 text-stone-100 placeholder:text-stone-500"
                />
                <Button 
                  onClick={handleAddTodo}
                  disabled={!newTodoText.trim() || createTodoMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {todosLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-stone-700/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : todos.length === 0 ? (
                <div className="text-center py-12 text-stone-400">
                  <CheckSquare className="w-12 h-12 mx-auto mb-3 text-stone-600" />
                  <p className="font-medium">Sin tareas todavía</p>
                  <p className="text-sm mt-1">Añade cosas que hacer antes del viaje</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todos.map((todo) => (
                    <div
                      key={todo.id}
                      className="flex items-center gap-3 p-4 rounded-lg hover:bg-stone-700/30 transition-colors group bg-stone-700/20"
                    >
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => toggleTodo(todo)}
                        className="h-5 w-5"
                      />
                      <span className={`flex-1 font-medium ${todo.completed ? 'line-through text-stone-500' : 'text-stone-100'}`}>
                        {todo.text}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTodoMutation.mutate(todo.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-stone-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {activeTab !== 'checklist' && (
            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-stone-700/50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-20 bg-stone-800/40 rounded-2xl border-2 border-dashed border-stone-700">
                  <FileText className="w-16 h-16 text-stone-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-stone-100 mb-2">
                    {activeTab === 'all' ? 'Sin documentos todavía' : `Sin documentos en esta categoría`}
                  </h3>
                  <p className="text-stone-400 mb-6">Sube tus documentos de viaje para acceder fácilmente</p>
                  <Button onClick={() => setDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                    <Upload className="w-4 h-4 mr-2" />
                    Subir documento
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredTickets.map((ticket) => (
                    <TicketCard 
                      key={ticket.id} 
                      ticket={ticket}
                      onDelete={(id) => deleteMutation.mutate(id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-stone-800 border-stone-700">
          <DialogHeader>
            <DialogTitle className="text-stone-100">Añadir Documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-stone-300 mb-2 block">Nombre</label>
              <Input
                placeholder="ej. Vuelo a Tokyo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-stone-700/50 border-stone-600 text-stone-100 placeholder:text-stone-500"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-stone-300 mb-2 block">Categoría</label>
              <Select 
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-stone-700/50 border-stone-600 text-stone-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-stone-800 border-stone-700">
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value} className="text-stone-100">
                      <div className="flex items-center gap-2">
                        <cat.icon className="w-4 h-4" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-stone-300 mb-2 block">Fecha</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-stone-700/50 border-stone-600 text-stone-100"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-stone-300 mb-2 block">Subir Archivo</label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-stone-600 rounded-xl cursor-pointer hover:border-stone-500 transition-colors bg-stone-700/20"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
                      <span className="text-stone-400">Subiendo...</span>
                    </>
                  ) : formData.file_url ? (
                    <>
                      <FileText className="w-5 h-5 text-green-500" />
                      <span className="text-green-400">Archivo subido</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-stone-400" />
                      <span className="text-stone-400">Haz clic para subir PDF o imagen</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-stone-300 mb-2 block">Notas</label>
              <Textarea
                placeholder="Notas adicionales..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="bg-stone-700/50 border-stone-600 text-stone-100 placeholder:text-stone-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-stone-600 text-stone-100 hover:bg-stone-700/50">
                Cancelar
              </Button>
              <Button 
                onClick={() => createMutation.mutate(formData)}
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={!formData.name.trim() || createMutation.isPending}
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