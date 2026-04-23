import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function TripChat({ tripId, myProfile }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['tripMessages', tripId],
    queryFn: () => base44.entities.TripMessage.filter({ trip_id: tripId }, 'created_date', 100),
    enabled: !!tripId,
    staleTime: 0,
  });

  // Suscripción en tiempo real
  useEffect(() => {
    if (!tripId) return;
    const unsub = base44.entities.TripMessage.subscribe((event) => {
      if (event.data?.trip_id === tripId) {
        queryClient.invalidateQueries({ queryKey: ['tripMessages', tripId] });
      }
    });
    return unsub;
  }, [tripId, queryClient]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: () => base44.entities.TripMessage.create({
      trip_id: tripId,
      user_id: user.id,
      user_email: user.email,
      display_name: myProfile?.display_name || user.full_name || user.email,
      avatar_url: myProfile?.avatar_url || null,
      content: text.trim(),
    }),
    onSuccess: () => {
      setText('');
      queryClient.invalidateQueries({ queryKey: ['tripMessages', tripId] });
    },
  });

  const handleSend = () => {
    if (!text.trim()) return;
    sendMutation.mutate();
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden flex flex-col" style={{ height: '420px' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-orange-50">
        <MessageCircle className="w-4 h-4 text-orange-700" />
        <span className="font-semibold text-sm text-foreground">Chat del grupo</span>
        <span className="ml-auto text-xs text-muted-foreground">{messages.length} mensajes</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
            Sin mensajes aún. ¡Di algo!
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.user_id === user?.id;
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className="flex-shrink-0">
                {msg.avatar_url ? (
                  <img src={msg.avatar_url} className="w-7 h-7 rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-700">
                    {(msg.display_name || msg.user_email || '?')[0].toUpperCase()}
                  </div>
                )}
              </div>
              {/* Bubble */}
              <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                <span className={`text-[10px] text-muted-foreground px-1 ${isMe ? 'text-right' : ''}`}>
                  {isMe ? 'Tú' : (msg.display_name || msg.user_email)}
                </span>
                <div className={`px-3 py-2 rounded-2xl text-sm leading-snug ${
                  isMe
                    ? 'bg-orange-700 text-white rounded-br-sm'
                    : 'bg-secondary text-foreground rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-muted-foreground px-1">
                  {isMe ? '' : ''}{format(new Date(msg.created_date), 'HH:mm')}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-3 flex gap-2">
        <Input
          placeholder="Escribe un mensaje..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          className="flex-1 text-sm"
          disabled={sendMutation.isPending}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!text.trim() || sendMutation.isPending}
          className="bg-orange-700 hover:bg-orange-800 flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}