import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, MessageCircle, Paperclip, Image, X, Download, ZoomIn } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

export default function TripChat({ tripId, myProfile, trip }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState(null); // image URL to show fullscreen
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['tripMessages', tripId],
    queryFn: () => base44.entities.TripMessage.filter({ trip_id: tripId }, 'created_date', 100),
    enabled: !!tripId,
    staleTime: 0,
  });

  // Real-time subscription
  useEffect(() => {
    if (!tripId) return;
    const unsub = base44.entities.TripMessage.subscribe((event) => {
      if (event.data?.trip_id === tripId) {
        queryClient.invalidateQueries({ queryKey: ['tripMessages', tripId] });
      }
    });
    return unsub;
  }, [tripId, queryClient]);

  // Auto-scroll — solo cuando llegan mensajes nuevos, no en refetch
  const lastMsgCount = useRef(0);
  useEffect(() => {
    if (messages.length > lastMsgCount.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    lastMsgCount.current = messages.length;
  }, [messages]);

  const notifyMembers = async (msgText) => {
    try {
      const members = trip?.members || [];
      const others = members.filter(email => email !== user.email);
      if (!others.length) return;
      const allProfiles = await base44.entities.UserProfile.list();
      others.forEach(email => {
        const profile = allProfiles.find(p =>
          p.email === email || p.user_email === email || p.contact_email === email
        );
        if (profile?.user_id) {
          
        }
      });
    } catch {}
  };

  const sendMutation = useMutation({
    mutationFn: (payload) => base44.entities.TripMessage.create({
      trip_id: tripId,
      user_id: user.id,
      user_email: user.email,
      display_name: myProfile?.display_name || user.full_name || user.email,
      avatar_url: myProfile?.avatar_url || null,
      ...payload,
    }),
    onSuccess: async (_, payload) => {
      setText('');
      queryClient.invalidateQueries({ queryKey: ['tripMessages', tripId] });
      await notifyMembers(payload.content || '📎 Archivo adjunto');
    },
  });

  // Upload file/photo and send as message
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const isImage = file.type.startsWith('image/');
    const maxMb = 10;
    if (file.size > maxMb * 1024 * 1024) {
      alert(`El archivo no puede superar ${maxMb}MB`);
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      sendMutation.mutate({
        content: isImage ? '' : file.name,
        file_url,
        file_type: isImage ? 'image' : 'file',
        file_name: file.name,
      });
    } catch (err) {
      alert('Error al subir el archivo: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSend = () => {
    if (!text.trim()) return;
    sendMutation.mutate({ content: text.trim() });
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isImageMsg = (msg) => msg.file_type === 'image' && msg.file_url;
  const isFileMsg  = (msg) => msg.file_type === 'file' && msg.file_url;

  return (
    <>
      {/* Lightbox — portal to escape overflow:hidden */}
      {lightbox && typeof document !== 'undefined' && createPortal(
        <div
          style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.93)',display:'flex',alignItems:'center',justifyContent:'center'}}
          onClick={() => setLightbox(null)}
        >
          <button
            style={{position:'absolute',top:20,right:20,width:40,height:40,borderRadius:'50%',background:'rgba(255,255,255,0.12)',border:'none',cursor:'pointer',color:'white',display:'flex',alignItems:'center',justifyContent:'center'}}
            onClick={() => setLightbox(null)}
          >
            <X size={18} />
          </button>
          <a
            href={lightbox} download
            style={{position:'absolute',top:20,right:70,width:40,height:40,borderRadius:'50%',background:'rgba(255,255,255,0.12)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',textDecoration:'none'}}
            onClick={e => e.stopPropagation()}
          >
            <Download size={18} />
          </a>
          <img
            src={lightbox}
            alt="Imagen"
            style={{maxWidth:'92vw',maxHeight:'88vh',objectFit:'contain',borderRadius:12}}
            onClick={e => e.stopPropagation()}
          />
        </div>,
        document.body
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col" style={{ height: '460px' }}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-orange-50 dark:bg-orange-950/20">
          <MessageCircle className="w-4 h-4 text-orange-700 dark:text-orange-400" />
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
          {messages.map((msg, idx) => {
            const msgDate = msg.created_date ? new Date(msg.created_date) : null;
            const prevDate = idx > 0 && messages[idx-1].created_date ? new Date(messages[idx-1].created_date) : null;
            const showDate = msgDate && (!prevDate || !isSameDay(msgDate, prevDate));
            const isMe = msg.user_id === user?.id;
            return (
              <div key={msg.id}>
                {showDate && msgDate && (
                  <div className="flex items-center gap-2 my-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[10px] text-muted-foreground font-medium px-2">
                      {format(msgDate, 'd MMM', { locale: es })}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                )}
                <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {msg.avatar_url ? (
                    <img src={msg.avatar_url} className="w-7 h-7 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-xs font-bold text-orange-700 dark:text-orange-400">
                      {(msg.display_name || msg.user_email || '?')[0].toUpperCase()}
                    </div>
                  )}
                </div>
                {/* Bubble */}
                <div className={`max-w-[72%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                  <span className={`text-[10px] text-muted-foreground px-1 ${isMe ? 'text-right' : ''}`}>
                    {isMe ? 'Tú' : (msg.display_name || msg.user_email)}
                  </span>

                  {/* Image message */}
                  {isImageMsg(msg) && (
                    <div
                      className="relative rounded-2xl overflow-hidden cursor-pointer group"
                      style={{ maxWidth: 200 }}
                      onClick={() => setLightbox(msg.file_url)}
                    >
                      <img
                        src={msg.file_url}
                        alt="foto"
                        className="w-full object-cover rounded-2xl"
                        style={{ maxHeight: 200 }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  )}

                  {/* File message */}
                  {isFileMsg(msg) && (
                    <a
                      href={msg.file_url}
                      download={msg.file_name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-sm ${
                        isMe
                          ? 'bg-orange-700 text-white rounded-br-sm'
                          : 'bg-secondary text-foreground rounded-bl-sm'
                      }`}
                    >
                      <Paperclip className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate max-w-[130px]">{msg.file_name || 'Archivo'}</span>
                      <Download className="w-3.5 h-3.5 flex-shrink-0" />
                    </a>
                  )}

                  {/* Text message */}
                  {!isImageMsg(msg) && !isFileMsg(msg) && (
                    <div className={`px-3 py-2 rounded-2xl text-sm leading-snug ${
                      isMe
                        ? 'bg-orange-700 text-white rounded-br-sm'
                        : 'bg-secondary text-foreground rounded-bl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  )}

                  <span className="text-[10px] text-muted-foreground px-1">
                    {format(new Date(msg.created_date), 'HH:mm')}
                  </span>
                </div>
                  </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="border-t border-border p-3 flex gap-2 items-center">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Attach button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || sendMutation.isPending}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-secondary hover:bg-secondary/80 transition-colors flex-shrink-0 text-muted-foreground"
            title="Adjuntar archivo o foto"
          >
            {uploading
              ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              : <Paperclip className="w-4 h-4" />
            }
          </button>

          {/* Image button (camera / gallery) */}
          <button
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.accept = 'image/*';
                fileInputRef.current.capture = 'environment';
                fileInputRef.current.click();
                // Reset accept after click
                setTimeout(() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = 'image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt';
                    fileInputRef.current.removeAttribute('capture');
                  }
                }, 500);
              }
            }}
            disabled={uploading || sendMutation.isPending}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-secondary hover:bg-secondary/80 transition-colors flex-shrink-0 text-muted-foreground"
            title="Enviar foto"
          >
            <Image className="w-4 h-4" />
          </button>

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
    </>
  );
}
