import { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import SpotCard from './SpotCard';
import SpotForm from './SpotForm';

const ALL_TYPES = [
  { value: 'all',       label: 'Todos',      emoji: '📍' },
  { value: 'food',      label: 'Comida',     emoji: '🍜' },
  { value: 'sight',     label: 'Atracción',  emoji: '🏛️' },
  { value: 'activity',  label: 'Actividad',  emoji: '⚡' },
  { value: 'shopping',  label: 'Compras',    emoji: '🛍️' },
  { value: 'transport', label: 'Transporte', emoji: '🚆' },
  { value: 'custom',    label: 'Otro',       emoji: '⭐' },
];

function canSeeSpot(spot, currentUserEmail, tripMembers) {
  if (spot.visibility === 'personal') return spot.created_by === currentUserEmail;
  if (spot.visibility === 'selected_users')
    return spot.created_by === currentUserEmail || (spot.shared_with || []).includes(currentUserEmail);
  // trip_members (default)
  return (tripMembers || []).includes(currentUserEmail);
}

export default function SpotsSection({ cityId, tripId, currentUserEmail, trip, days = [] }) {
  const [activeType, setActiveType] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const tripMembers = trip?.members || [];

  const { data: spots = [], isLoading } = useQuery({
    queryKey: ['spots', cityId],
    queryFn: () => base44.entities.Spot.filter({ trip_id: tripId, city_id: cityId }),
    enabled: !!cityId && !!tripId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Spot.create({
      ...data,
      trip_id: tripId,
      city_id: cityId,
      created_by: currentUserEmail,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spots', cityId] });
      toast({ title: 'Spot añadido 📍' });
    },
  });

  const visibleSpots = useMemo(
    () => spots.filter((s) => canSeeSpot(s, currentUserEmail, tripMembers)),
    [spots, currentUserEmail, tripMembers]
  );

  const filteredSpots = useMemo(
    () => activeType === 'all' ? visibleSpots : visibleSpots.filter((s) => s.type === activeType),
    [visibleSpots, activeType]
  );

  return (
    <div className="mt-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-semibold text-foreground">📍 Lugares</h2>
        <Button onClick={() => setFormOpen(true)} className="bg-orange-700 hover:bg-orange-800">
          <Plus className="w-4 h-4 mr-1.5" />
          Añadir spot
        </Button>
      </div>

      {/* Type filter chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {ALL_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setActiveType(t.value)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              activeType === t.value
                ? 'bg-orange-700 text-white border-orange-700'
                : 'bg-white text-foreground border-border hover:border-orange-300'
            }`}
          >
            <span>{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-20 bg-secondary rounded-xl animate-pulse" />)}
        </div>
      ) : filteredSpots.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl bg-white">
          <p className="text-3xl mb-2">📍</p>
          <p className="text-muted-foreground text-sm">
            {activeType === 'all' ? 'Aún no hay lugares guardados' : `No hay spots de tipo "${ALL_TYPES.find(t=>t.value===activeType)?.label}"`}
          </p>
          <Button onClick={() => setFormOpen(true)} variant="outline" size="sm" className="mt-4">
            <Plus className="w-4 h-4 mr-1.5" />
            Añadir el primero
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSpots.map((spot) => (
            <SpotCard
              key={spot.id}
              spot={spot}
              days={days}
              currentUserEmail={currentUserEmail}
              cityId={cityId}
              tripId={tripId}
            />
          ))}
        </div>
      )}

      <SpotForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={(data) => createMutation.mutate(data)}
        isPending={createMutation.isPending}
        tripMembers={tripMembers.filter((e) => e !== currentUserEmail)}
      />
    </div>
  );
}