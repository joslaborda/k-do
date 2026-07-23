import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Calendar, ArrowRight, Map, Plane } from 'lucide-react';
import { useLike } from '@/hooks/useLike';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { createPageUrl } from '@/utils';

export default function TemplateCard({ template, currentUser }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { isLiked, count: likeCount, toggle: toggleLike } = useLike({
    targetId: template.id,
    targetType: 'template',
    userId: currentUser?.id,
    targetOwnerId: template.created_by_user_id,
  });

  // Query para colección del usuario
  const { data: myCollection } = useQuery({
    queryKey: ['myCollection', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      const results = await base44.entities.Collection.filter({
        owner_user_id: currentUser.id,
        name: 'Guardados'
      });
      return results[0] || null;
    },
    enabled: !!currentUser?.id
  });

  const isSaved =
    myCollection &&
    myCollection.template_ids &&
    myCollection.template_ids.includes(template.id);

  // Mutation para guardar/quitar
  const saveMutation = useMutation({
    mutationFn: async (save) => {
      // No usar el `myCollection` de la caché de react-query aquí: es del
      // momento del render, y si esta u otra TemplateCard de la misma
      // colección guarda casi a la vez, la segunda escritura pisaba la
      // primera (leía-modificaba-escribía sobre datos ya obsoletos). Se
      // relee la colección justo antes de escribir para evitarlo.
      const fresh = currentUser?.id
        ? (await base44.entities.Collection.filter({ owner_user_id: currentUser.id, name: 'Guardados' }))[0] || null
        : null;
      if (!fresh) {
        const newCollection = await base44.entities.Collection.create({
          owner_user_id: currentUser.id,
          name: 'Guardados',
          template_ids: [template.id]
        });
        return newCollection;
      } else {
        const currentIds = fresh.template_ids || [];
        const updatedIds = save
          ? (currentIds.includes(template.id) ? currentIds : [...currentIds, template.id])
          : currentIds.filter((id) => id !== template.id);
        await base44.entities.Collection.update(fresh.id, {
          template_ids: updatedIds
        });
        return { ...fresh, template_ids: updatedIds };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCollection', currentUser?.id] });
    },
    onError: (e) => toast({ title: t('common.saveError'), description: e?.message || t('common.tryAgain'), variant: 'destructive' }),
  });

  const handleSaveToggle = (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast({
        title: t('explore.mustSignIn'),
        description: t('explore.mustSignInDesc')
      });
      return;
    }
    saveMutation.mutate(!isSaved);
  };

  return (
    <Link to={`${createPageUrl('TemplateDetail')}?id=${template.id}`}>
      <div className="group h-full bg-card border border-border rounded-2xl overflow-hidden transition-colors cursor-pointer flex flex-col">
        {/* Image */}
        <div className="relative h-40 overflow-hidden bg-muted">
          {template.cover_image ? (
            <img
              src={template.cover_image}
              alt={template.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {template.countries?.[0]
                ? <Map className="w-12 h-12 text-border" strokeWidth={1.5} />
                : <Plane className="w-12 h-12 text-border" strokeWidth={1.5} />}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Badge premium */}
          {template.is_premium && (
            <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              ✦ Premium · {template.price ? `${template.price}€` : ''}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-4">
          {/* Title */}
          <h3 className="text-lg font-bold text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {template.title}
          </h3>

          {/* Summary */}
          {template.summary && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {template.summary}
            </p>
          )}

          {/* Creator */}
          {template.creator_username && (
            <p className="text-xs text-muted-foreground mb-2">
              por <span className="font-medium text-primary">@{template.creator_username}</span>
            </p>
          )}

          {/* Meta */}
          <div className="space-y-2 mb-4">
            {template.duration_days && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {template.duration_days} días
              </div>
            )}
            {template.countries && template.countries.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{template.countries.join(', ')}</span>
              </div>
            )}
            {template.cities && template.cities.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {template.cities.length} ciudad{template.cities.length > 1 ? 'es' : ''}
              </div>
            )}
            {template.saves_count > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Heart className="w-3 h-3" />
                {template.saves_count} guardados
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 mt-auto">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-border text-foreground hover:bg-secondary gap-1"
            >
              <ArrowRight className="w-3 h-3" />
              Ver
            </Button>
            <button
              onClick={(e) => { e.preventDefault(); toggleLike(); }}
              className={"inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors " +
                (isLiked ? "bg-red-50 text-red-500 border border-red-200" : "bg-secondary text-muted-foreground border border-border hover:bg-red-50 hover:text-red-400")}
            >
              <Heart className={"w-3.5 h-3.5 " + (isLiked ? "fill-current" : "")}/>
              {likeCount > 0 ? likeCount : ""}
            </button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSaveToggle}
              disabled={saveMutation.isPending || !currentUser}
              className={`px-3 ${
                isSaved ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Heart className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
