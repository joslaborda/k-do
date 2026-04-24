import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createNotification } from '@/lib/notifications';

/**
 * useLike — hook reutilizable para dar/quitar like a un spot o template
 * @param {string} targetId — ID del contenido
 * @param {string} targetType — 'spot' | 'template'
 * @param {string} userId — ID del usuario actual
 * @param {string} targetOwnerId — ID del propietario del contenido (para notificación)
 */
export function useLike({ targetId, targetType, userId, targetOwnerId }) {
  const queryClient = useQueryClient();
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
        // Notificar al propietario si no es el mismo usuario
        if (targetOwnerId && targetOwnerId !== userId) {
          try {
            createNotification({
              userId: targetOwnerId,
              type: 'like',
              refId: targetId,
              message: targetType === 'spot' ? 'Le ha gustado tu spot' : 'Le ha gustado tu itinerario',
            });
          } catch {}
        }
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qKey }),
  });

  return { isLiked, count, toggle: () => mutation.mutate(), loading: mutation.isPending };
}