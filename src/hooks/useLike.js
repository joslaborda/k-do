import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useLike({ entityType, entityId, userId }) {
  const queryClient = useQueryClient();
  const queryKey = ['likes', entityType, entityId];

  const { data: likes = [] } = useQuery({
    queryKey,
    queryFn: () => base44.entities.Like?.filter({ entity_type: entityType, entity_id: entityId }) || [],
    enabled: !!entityId,
    staleTime: 30000,
  });

  const isLiked = userId ? likes.some(l => l.user_id === userId) : false;
  const likeRecord = userId ? likes.find(l => l.user_id === userId) : null;

  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (isLiked && likeRecord) {
        await base44.entities.Like.delete(likeRecord.id);
      } else {
        await base44.entities.Like.create({ entity_type: entityType, entity_id: entityId, user_id: userId });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    likes,
    likesCount: likes.length,
    isLiked,
    toggle: () => toggleMutation.mutate(),
    isPending: toggleMutation.isPending,
  };
}