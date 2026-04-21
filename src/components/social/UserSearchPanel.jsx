import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, User } from 'lucide-react';

export default function UserSearchPanel({ currentUserId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Query: todos los usuarios
  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.UserProfile.list(),
    staleTime: 1000 * 60 * 10, // 10 min
  });

  // Query: usuarios que sigue el actual
  const { data: followingData = [] } = useQuery({
    queryKey: ['following', currentUserId],
    queryFn: () => base44.entities.Follow.filter({ follower_user_id: currentUserId }),
    enabled: !!currentUserId,
    staleTime: 1000 * 60 * 10,
  });

  const followedUserIds = followingData.map((f) => f.followed_user_id);

  // Filtrar usuarios basado en búsqueda
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allUsers.filter((user) => {
      const matchesUsername = user.username?.toLowerCase().includes(query);
      const matchesDisplayName = user.display_name?.toLowerCase().includes(query);
      const matchesCountry = user.home_country?.toLowerCase().includes(query);
      return (matchesUsername || matchesDisplayName || matchesCountry) && user.user_id !== currentUserId;
    });
  }, [searchQuery, allUsers, currentUserId]);

  // Mutation: Follow
  const followMutation = useMutation({
    mutationFn: async (targetUserId) => {
      await base44.entities.Follow.create({
        follower_user_id: currentUserId,
        followed_user_id: targetUserId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following', currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['templatesFollowing'] });
    }
  });

  // Mutation: Unfollow
  const unfollowMutation = useMutation({
    mutationFn: async (targetUserId) => {
      const follows = await base44.entities.Follow.filter({
        follower_user_id: currentUserId,
        followed_user_id: targetUserId
      });
      if (follows[0]) {
        await base44.entities.Follow.delete(follows[0].id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following', currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['templatesFollowing'] });
    }
  });

  const handleToggleFollow = (userId, isFollowing) => {
    if (isFollowing) {
      unfollowMutation.mutate(userId);
    } else {
      followMutation.mutate(userId);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-foreground mb-2">🔍 Buscar usuarios</h3>
        <Input
          placeholder="Busca por username, nombre o país..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-orange-50 border-border"
        />
      </div>

      {usersLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-orange-700" />
        </div>
      ) : filteredUsers.length === 0 && searchQuery.trim() ? (
        <div className="text-center py-8 text-muted-foreground">
          No se encontraron usuarios con ese término
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Escribe para buscar usuarios
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredUsers.map((userProfile) => {
            const isFollowing = followedUserIds.includes(userProfile.user_id);
            return (
              <div
                key={userProfile.id}
                className="flex items-center justify-between p-3 bg-white border border-border rounded-lg hover:bg-orange-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {userProfile.avatar_url ? (
                    <img
                      src={userProfile.avatar_url}
                      alt={userProfile.display_name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-orange-700" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{userProfile.display_name}</p>
                    <p className="text-xs text-muted-foreground font-mono">@{userProfile.username}</p>
                    {userProfile.home_country && (
                      <p className="text-xs text-muted-foreground">{userProfile.home_country}</p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={isFollowing ? 'default' : 'outline'}
                  onClick={() => handleToggleFollow(userProfile.user_id, isFollowing)}
                  disabled={followMutation.isPending || unfollowMutation.isPending}
                  className={isFollowing ? 'bg-orange-700 hover:bg-orange-800' : ''}
                >
                  {isFollowing ? 'Siguiendo' : 'Seguir'}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}