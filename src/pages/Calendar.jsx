import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plane, Train, Hotel, Ticket as TicketIcon, Shield, Plus, Trash2, Calendar as CalendarIcon, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const categoryConfig = {
  flight: { label: 'Vuelo', icon: Plane, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  train: { label: 'Tren', icon: Train, color: 'from-green-500 to-emerald-500', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  hotel: { label: 'Hotel', icon: Hotel, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  freetour: { label: 'Free Tour', icon: TicketIcon, color: 'from-orange-500 to-red-500', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  insurance: { label: 'Seguro', icon: Shield, color: 'from-indigo-500 to-blue-500', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
};

export default function Calendar() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'flight',
    date: '',
    notes: '',
    file_url: '',
  });

  const queryClient = useQueryClient();

  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => base44.entities.Ticket.list('-date'),
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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, file_url });
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploadingFile(false);
    }
  };

  const groupedTickets = tickets.reduce((acc, ticket) => {
    if (!acc[ticket.category]) acc[ticket.category] = [];
    acc[ticket.category].push(ticket);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20 dark:from-stone-900 dark:via-stone-900 dark:to-stone-900 transition-colors">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-stone-200 dark:bg-stone-900/80">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-stone-900 mb-2">Documentos ✈️</h1>
              <p className="text-stone-600">Vuelos, trenes, hoteles y más</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 pb-24">
        {/* Redirect to Tickets page */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-stone-800 dark:to-stone-800 border-2 border-blue-200 dark:border-stone-700 rounded-3xl p-12 text-center">
          <Plane className="w-20 h-20 text-blue-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-3">
            Gestiona tus documentos
          </h2>
          <p className="text-stone-600 dark:text-stone-400 mb-6 max-w-md mx-auto">
            Guarda y organiza tus vuelos, reservas de hotel, billetes de tren y más
          </p>
          <Link to={createPageUrl('Tickets')}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plane className="w-4 h-4 mr-2" />
              Ir a Documentos
            </Button>
          </Link>
        </div>


      </div>
    </div>
  );
}