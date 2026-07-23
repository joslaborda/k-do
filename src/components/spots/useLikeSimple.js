import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

export default
function useLikeSimple(spotId, userId, targetOwnerId) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();
  const isReal = spotId && !String(spotId).startsWith('seed_');

  const { data: likes = [] } = useQuery({
    queryKey: ['likes', 'spot', spotId],
    queryFn: () => base44.entities.Like.filter({ target_id: spotId, target_type: 'spot' }),
    enabled: !!spotId && !!userId && isReal,
    staleTime: 30000,
  });

  const likeRecord = likes.find(l => l.user_id === userId);
  const isLiked = !!likeRecord;
  const count = isReal ? likes.length : 0;

  const mutation = useMutation({
    mutationFn: async () => {
      if (isLiked && likeRecord) {
        await base44.entities.Like.delete(likeRecord.id);
      } else {
        // Sin target_owner_id, el dueño del spot nunca se enteraba de que le
        // habían dado like (useLike.js sí lo guarda; este hook "simple" se
        // había quedado atrás).
        await base44.entities.Like.create({ user_id: userId, target_id: spotId, target_type: 'spot', target_owner_id: targetOwnerId || null });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['likes', 'spot', spotId] }),
    onError: (e) => toast({ title: t('common.error'), description: e?.message || t('common.tryAgain'), variant: 'destructive' }),
  });

  return { isLiked, count, toggle: () => { if (isReal && userId && !mutation.isPending) mutation.mutate(); } };
}

