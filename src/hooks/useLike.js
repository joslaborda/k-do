import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

/**
 * useLike — hook reutilizable para dar/quitar like a un spot o template
 * @param {string} targetId — ID del contenido
 * @param {string} targetType — 'spot' | 'template'
 * @param {string} userId — ID del usuario actual
 * @param {string} targetOwnerId — ID del propietario (para notificación)
 */
export function useLike({ targetId, targetType, userId, targetOwnerId }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();
  const qKey = ['likes', targetType, targetId];

  const { data: likes = [] } = useQuery({
    queryKey: qKey,
    queryFn: () => base44.entities.Like.filter({ target_id: targetId, target_type: targetType }),
    enabled: !!targetId && !!targetType,
    staleTime: 30000,
  });

  const likeRecord = likes.find(l => l.user_id === userId);
  const isLiked = !!likeRecord;
  const count = likes.length;

  const mutation = useMutation({
    mutationFn: async () => {
      if (isLiked && likeRecord) {
        await base44.entities.Like.delete(likeRecord.id);
      } else {
        await base44.entities.Like.create({
          user_id: userId,
          target_id: targetId,
          target_type: targetType,
          target_owner_id: targetOwnerId || null,
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qKey }),
    // Antes sin onError: si fallaba (red, permisos), el corazón simplemente
    // no cambiaba de estado y no había ningún aviso de por qué.
    onError: (e) => toast({ title: t('common.error'), description: e?.message || t('common.tryAgain'), variant: 'destructive' }),
  });

  return { isLiked, count, toggle: () => { if (!mutation.isPending) mutation.mutate(); }, loading: mutation.isPending };
}