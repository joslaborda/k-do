import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Share2, Copy, CheckCircle, Globe, Lock, LinkIcon, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { publishTripAsTemplate, getTemplateShareUrl } from '@/lib/publishTripAsTemplate';

const VISIBILITY_OPTIONS = [
  { value: 'private', label: 'Privado (solo yo)', icon: Lock, description: 'Nadie más puede verlo' },
  { value: 'unlisted', label: 'No listado (link)', icon: LinkIcon, description: 'Accesible solo con el enlace' },
  { value: 'public', label: 'Público (Explorar)', icon: Globe, description: 'Aparece en la sección Explorar' }
];

export default function PublishSection({
  trip,
  cities,
  user,
  profile,
  isAdmin,
  onPublish
}) {
  const [visibility, setVisibility] = useState(trip?.template_visibility || 'private');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (trip?.template_visibility) {
      setVisibility(trip.template_visibility);
    }
  }, [trip?.template_visibility]);

  const handlePublish = async () => {
    if (!isAdmin) {
      toast({ title: 'Acceso denegado', description: 'Solo admins pueden publicar' });
      return;
    }

    setLoading(true);
    try {
      const result = await publishTripAsTemplate(trip, cities, user, profile, visibility);
      toast({
        title: '✨ Itinerario publicado',
        description: `Tu viaje ahora es ${visibility === 'public' ? 'público' : visibility === 'unlisted' ? 'no listado' : 'privado'}`
      });
      if (onPublish) onPublish(result);
    } catch (error) {
      toast({
        title: 'Error al publicar',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!trip?.template_id) return;
    const url = getTemplateShareUrl(trip.template_id);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Enlace copiado', description: 'Puedes compartirlo con otros' });
  };

  const currentVisibilityOption = VISIBILITY_OPTIONS.find(opt => opt.value === visibility);
  const isPublished = !!trip?.template_id;

  return (
    <div className="glass rounded-2xl border border-border p-6 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-orange-700" />
          Publicar Itinerario
        </h3>
        <p className="text-sm text-muted-foreground">
          Comparte tu itinerario con otros viajeros. (Sin documentos, gastos ni diarios)
        </p>
      </div>

      {/* Status Badge */}
      {isPublished && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">Publicado</p>
            <p className="text-xs text-green-800">
              {visibility === 'private' && 'Solo tú puedes verlo'}
              {visibility === 'unlisted' && 'Accesible por enlace'}
              {visibility === 'public' && 'Visible en Explorar'}
            </p>
          </div>
        </div>
      )}

      {/* Visibility Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground block">Visibilidad</label>
        <Select value={visibility} onValueChange={setVisibility}>
          <SelectTrigger className="bg-input border-border text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {VISIBILITY_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <SelectItem key={opt.value} value={opt.value} className="text-foreground">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <div>
                      <p className="font-medium">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.description}</p>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Info Cards por Visibility */}
      <div className="space-y-2">
        {visibility === 'private' && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Privado:</strong> Solo tú puedes ver y editar este itinerario. Nadie más podrá acceder a él ni aparecerá en Explorar.
            </p>
          </div>
        )}
        {visibility === 'unlisted' && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-xs text-purple-800">
              <strong>No listado:</strong> Accesible por enlace directo, pero no aparecerá en Explorar. Perfecto para compartir con gente específica.
            </p>
          </div>
        )}
        {visibility === 'public' && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-xs text-orange-800">
              <strong>Público:</strong> Aparecerá en Explorar y otros viajeros podrán descubrirlo y guardarlo.
            </p>
          </div>
        )}
      </div>

      {/* Publish Button */}
      {!isAdmin && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-800">
            <strong>Permisos:</strong> Solo los admins del viaje pueden publicar itinerarios.
          </p>
        </div>
      )}

      <Button
        onClick={handlePublish}
        disabled={loading || !isAdmin}
        className="w-full bg-orange-700 hover:bg-orange-800 text-white font-medium"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Publicando...
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4 mr-2" />
            {isPublished && visibility === trip?.template_visibility ? 'Actualizar Publicación' : 'Publicar Ahora'}
          </>
        )}
      </Button>

      {/* Share Link (si está publicado y es unlisted/public) */}
      {isPublished && (visibility === 'unlisted' || visibility === 'public') && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
          <p className="text-sm font-medium text-foreground">Enlace para compartir</p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={getTemplateShareUrl(trip.template_id)}
              className="flex-1 px-3 py-2 bg-white border border-border rounded-lg text-xs text-muted-foreground focus:outline-none"
            />
            <Button
              size="sm"
              variant={copied ? 'default' : 'outline'}
              onClick={handleCopyLink}
              className={copied ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {visibility === 'unlisted' ? 'Comparte este enlace con quien quieras' : 'Aparecerá en Explorar automáticamente'}
          </p>
        </div>
      )}
    </div>
  );
}