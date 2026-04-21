import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Fetches the UserProfile for a given userId.
 * Returns { profile, isLoading, refetch }
 */
export function useUserProfile(userId) {
  const { data = [], isLoading, refetch } = useQuery({
    queryKey: ['myProfile', userId],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: userId }),
    enabled: !!userId,
    staleTime: 60000,
  });

  return { profile: data[0] || null, isLoading, refetch };
}