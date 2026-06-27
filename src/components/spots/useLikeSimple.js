import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default
function useLikeSimple(spotId, userId) {
  const queryClient = useQueryClient();
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
        await base44.entities.Like.create({ user_id: userId, target_id: spotId, target_type: 'spot' });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['likes', 'spot', spotId] }),
  });

  return { isLiked, count, toggle: () => { if (isReal && userId && !mutation.isPending) mutation.mutate(); } };
}

