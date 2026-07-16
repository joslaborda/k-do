import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default
function InlineCommentsPopup({ spot, userId, onClose }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [text, setText] = useState('');

  const { data: userProfile } = useQuery({
    queryKey: ['myProfile', userId],
    queryFn: async () => { const r = await base44.entities.UserProfile.filter({ user_id: userId }); return r[0] || null; },
    enabled: !!userId, staleTime: 60000,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['spotComments', spot.id],
    queryFn: () => base44.entities.SpotComment.filter({ spot_id: spot.id }),
    staleTime: 15000,
  });

  const mutation = useMutation({
    mutationFn: () => base44.entities.SpotComment.create({
      spot_id: spot.id, user_id: userId,
      user_display_name: userProfile?.display_name || '',
      username: userProfile?.username || '',
      user_avatar: userProfile?.avatar_url || '',
      thumb: 'up',
      text: text.trim() || null,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['spotComments', spot.id] }); setText(''); },
  });

  const handleSubmit = () => {
    if (!text.trim()) return;
    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 pb-[80px]" onClick={onClose}>
      <div className="bg-card w-full max-w-md rounded-t-2xl flex flex-col" style={{ maxHeight: 'calc(75vh - 80px)' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-border flex-shrink-0">
          <div className="w-9 h-1 bg-border rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <p className="font-semibold text-foreground text-sm">{spot.title}</p>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {comments.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-6">{t('spots.comments.emptyShort')}</p>
          )}
          {comments.map(c => (
            <div key={c.id} className="flex gap-2">
              {(c.user_avatar || c.avatar_url)
                ? <img src={c.user_avatar || c.avatar_url} alt={c.user_display_name||''} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                : <div className="w-7 h-7 rounded-full bg-orange-100 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">{(c.user_display_name||'?')[0].toUpperCase()}</div>
              }
              <div className="flex-1 bg-secondary rounded-2xl rounded-tl-none px-3 py-2">
                <span className="text-xs font-semibold text-foreground">@{c.username || c.user_display_name}</span>
                {c.text && <p className="text-sm text-foreground mt-0.5">{c.text}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="px-4 py-3 border-t border-border flex-shrink-0">
          <div className="flex gap-2 items-end">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
              placeholder={t('spots.comments.writePlaceholder')}
              className="flex-1 text-sm border border-border rounded-2xl px-3 py-2.5 resize-none outline-none focus:border-primary bg-secondary min-h-[40px] max-h-24"
              rows={1}
            />
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || mutation.isPending}
              className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-40 flex-shrink-0 transition-opacity"
            >
              {mutation.isPending
                ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

