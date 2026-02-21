import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Languages, ArrowRightLeft, Copy, Check, Volume2, Loader2, ChevronDown, Search, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const phraseCategories = [
  {
    name: 'Básicas',
    icon: '👋',
    phrases: [
      { spanish: 'Hola', japanese: 'こんにちは', romaji: 'Konnichiwa' },
      { spanish: 'Buenos días', japanese: 'おはようございます', romaji: 'Ohayou gozaimasu' },
      { spanish: 'Buenas noches', japanese: 'こんばんは', romaji: 'Konbanwa' },
      { spanish: 'Gracias', japanese: 'ありがとうございます', romaji: 'Arigatou gozaimasu' },
      { spanish: 'De nada', japanese: 'どういたしまして', romaji: 'Dou itashimashite' },
      { spanish: 'Perdón / Disculpe', japanese: 'すみません', romaji: 'Sumimasen' },
      { spanish: 'Lo siento', japanese: 'ごめんなさい', romaji: 'Gomen nasai' },
      { spanish: 'Sí', japanese: 'はい', romaji: 'Hai' },
      { spanish: 'No', japanese: 'いいえ', romaji: 'Iie' },
      { spanish: 'Por favor', japanese: 'お願いします', romaji: 'Onegaishimasu' },
    ]
  },
  {
    name: 'Restaurante',
    icon: '🍜',
    phrases: [
      { spanish: '¿Puedo tener agua, por favor?', japanese: 'お水をください', romaji: 'Omizu wo kudasai' },
      { spanish: 'La cuenta, por favor', japanese: 'お会計お願いします', romaji: 'Okaikei onegaishimasu' },
      { spanish: '¿Tienen menú en inglés?', japanese: '英語のメニューはありますか？', romaji: 'Eigo no menyuu wa arimasu ka?' },
      { spanish: 'Esto está delicioso', japanese: 'おいしいです', romaji: 'Oishii desu' },
      { spanish: 'Una cerveza, por favor', japanese: 'ビールをください', romaji: 'Biiru wo kudasai' },
      { spanish: 'Soy vegetariano', japanese: '私はベジタリアンです', romaji: 'Watashi wa bejitarian desu' },
      { spanish: 'Sin carne, por favor', japanese: '肉なしでお願いします', romaji: 'Niku nashi de onegaishimasu' },
      { spanish: '¿Qué me recomienda?', japanese: 'おすすめは何ですか？', romaji: 'Osusume wa nan desu ka?' },
      { spanish: 'Mesa para dos, por favor', japanese: '二人用のテーブルをお願いします', romaji: 'Futari you no teeburu wo onegaishimasu' },
      { spanish: 'Estaba muy rico', japanese: 'ごちそうさまでした', romaji: 'Gochisousama deshita' },
    ]
  },
  {
    name: 'Direcciones',
    icon: '🗺️',
    phrases: [
      { spanish: '¿Dónde está el baño?', japanese: 'トイレはどこですか？', romaji: 'Toire wa doko desu ka?' },
      { spanish: '¿Dónde está la estación?', japanese: '駅はどこですか？', romaji: 'Eki wa doko desu ka?' },
      { spanish: '¿Cómo llego a...?', japanese: '...への行き方を教えてください', romaji: '...e no ikikata wo oshiete kudasai' },
      { spanish: 'Estoy perdido', japanese: '道に迷いました', romaji: 'Michi ni mayoimashita' },
      { spanish: '¿Está lejos?', japanese: '遠いですか？', romaji: 'Tooi desu ka?' },
      { spanish: 'A la derecha', japanese: '右', romaji: 'Migi' },
      { spanish: 'A la izquierda', japanese: '左', romaji: 'Hidari' },
      { spanish: 'Recto / Todo derecho', japanese: 'まっすぐ', romaji: 'Massugu' },
      { spanish: '¿Puede mostrarme en el mapa?', japanese: '地図で見せてもらえますか？', romaji: 'Chizu de misete moraemasu ka?' },
    ]
  },
  {
    name: 'Transporte',
    icon: '🚃',
    phrases: [
      { spanish: 'Un billete a..., por favor', japanese: '...までの切符をください', romaji: '...made no kippu wo kudasai' },
      { spanish: '¿Este tren va a...?', japanese: 'この電車は...に行きますか？', romaji: 'Kono densha wa ...ni ikimasu ka?' },
      { spanish: '¿Cuál es la próxima parada?', japanese: '次の駅は何ですか？', romaji: 'Tsugi no eki wa nan desu ka?' },
      { spanish: '¿A qué hora sale?', japanese: '何時に出発しますか？', romaji: 'Nanji ni shuppatsu shimasu ka?' },
      { spanish: '¿Tengo que hacer trasbordo?', japanese: '乗り換えが必要ですか？', romaji: 'Norikae ga hitsuyou desu ka?' },
      { spanish: 'Quiero ir a...', japanese: '...に行きたいです', romaji: '...ni ikitai desu' },
    ]
  },
  {
    name: 'Compras',
    icon: '🛍️',
    phrases: [
      { spanish: '¿Cuánto cuesta?', japanese: 'いくらですか？', romaji: 'Ikura desu ka?' },
      { spanish: '¿Aceptan tarjeta?', japanese: 'カードは使えますか？', romaji: 'Kaado wa tsukaemasu ka?' },
      { spanish: 'Solo estoy mirando', japanese: '見ているだけです', romaji: 'Miteiru dake desu' },
      { spanish: '¿Tiene otro color?', japanese: '他の色はありますか？', romaji: 'Hoka no iro wa arimasu ka?' },
      { spanish: '¿Tiene talla más grande?', japanese: 'もっと大きいサイズはありますか？', romaji: 'Motto ookii saizu wa arimasu ka?' },
      { spanish: 'Me lo llevo', japanese: 'これをください', romaji: 'Kore wo kudasai' },
      { spanish: '¿Está libre de impuestos?', japanese: '免税ですか？', romaji: 'Menzei desu ka?' },
    ]
  },
  {
    name: 'Emergencias',
    icon: '🆘',
    phrases: [
      { spanish: 'Ayuda', japanese: '助けて', romaji: 'Tasukete' },
      { spanish: 'Necesito un médico', japanese: '医者が必要です', romaji: 'Isha ga hitsuyou desu' },
      { spanish: 'Llame a la policía', japanese: '警察を呼んでください', romaji: 'Keisatsu wo yonde kudasai' },
      { spanish: 'Necesito ir al hospital', japanese: '病院に行きたいです', romaji: 'Byouin ni ikitai desu' },
      { spanish: 'Perdí mi pasaporte', japanese: 'パスポートを失くしました', romaji: 'Pasupooto wo nakushimashita' },
      { spanish: 'No me encuentro bien', japanese: '気分が悪いです', romaji: 'Kibun ga warui desu' },
      { spanish: 'Soy alérgico a...', japanese: '...にアレルギーがあります', romaji: '...ni arerugii ga arimasu' },
    ]
  },
  {
    name: 'Hotel',
    icon: '🏨',
    phrases: [
      { spanish: 'Tengo una reserva', japanese: '予約があります', romaji: 'Yoyaku ga arimasu' },
      { spanish: '¿A qué hora es el check-out?', japanese: 'チェックアウトは何時ですか？', romaji: 'Chekkuauto wa nanji desu ka?' },
      { spanish: '¿Hay WiFi gratis?', japanese: '無料のWiFiはありますか？', romaji: 'Muryou no WiFi wa arimasu ka?' },
      { spanish: '¿Pueden guardar mi equipaje?', japanese: '荷物を預かってもらえますか？', romaji: 'Nimotsu wo azukatte moraemasu ka?' },
      { spanish: 'La llave de la habitación, por favor', japanese: '部屋の鍵をください', romaji: 'Heya no kagi wo kudasai' },
    ]
  },
  {
    name: 'Números',
    icon: '🔢',
    phrases: [
      { spanish: 'Uno', japanese: '一', romaji: 'Ichi' },
      { spanish: 'Dos', japanese: '二', romaji: 'Ni' },
      { spanish: 'Tres', japanese: '三', romaji: 'San' },
      { spanish: 'Cuatro', japanese: '四', romaji: 'Yon / Shi' },
      { spanish: 'Cinco', japanese: '五', romaji: 'Go' },
      { spanish: 'Diez', japanese: '十', romaji: 'Juu' },
      { spanish: 'Cien', japanese: '百', romaji: 'Hyaku' },
      { spanish: 'Mil', japanese: '千', romaji: 'Sen' },
    ]
  },
];

export default function Translator() {
   const [inputText, setInputText] = useState('');
   const [translatedText, setTranslatedText] = useState('');
   const [isTranslating, setIsTranslating] = useState(false);
   const [direction, setDirection] = useState('es-jp'); // es-jp or jp-es
   const [copiedId, setCopiedId] = useState(null);
   const [expandedCategories, setExpandedCategories] = useState({ 'Básicas': true, 'Restaurante': true });
   const [searchQuery, setSearchQuery] = useState('');

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    
    setIsTranslating(true);
    const prompt = direction === 'es-jp' 
      ? `Traduce el siguiente texto del español al japonés. Proporciona:
1. La traducción en japonés (kanji/hiragana)
2. La romanización (romaji)
3. Una nota de pronunciación si es útil

Texto: "${inputText}"

Responde en formato claro y fácil de leer.`
      : `Traduce el siguiente texto del japonés al español.

Texto: "${inputText}"

Si el texto está en romaji, también tradúcelo. Proporciona una traducción clara y natural en español.`;

    const result = await base44.integrations.Core.InvokeLLM({ prompt });
    setTranslatedText(result);
    setIsTranslating(false);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleCategory = (name) => {
    setExpandedCategories(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const speakJapanese = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  const filteredCategories = phraseCategories.map(cat => ({
    ...cat,
    phrases: cat.phrases.filter(phrase => 
      phrase.spanish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phrase.japanese.includes(searchQuery) ||
      phrase.romaji.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.phrases.length > 0);

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header con caja naranja */}
      <div className="bg-orange-700 pt-12 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-white text-4xl font-bold">Traductor 🌐</h1>
          <p className="text-white/90 mt-2">Traduce y aprende frases útiles para tu viaje</p>
        </div>
      </div>

      <div className="bg-orange-50 mx-auto px-6 pt-6 pb-12 md:pb-6 max-w-5xl -mt-12">

        <Tabs defaultValue="translator" className="space-y-6">
          <TabsList className="glass border border-border p-1">
            <TabsTrigger value="phrases" className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-secondary">
              📖 Frases útiles
            </TabsTrigger>
            <TabsTrigger value="translator" className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-secondary">
              🔄 Traductor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="translator" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Input */}
              <div className="glass border border-border rounded-2xl p-6 shadow-xl">
                <div className="mb-4">
                  <label className="text-sm font-semibold text-foreground mb-3 block">Entrada</label>
                  <div className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors inline-block ${direction === 'es-jp' ? 'bg-indigo-600/20 text-foreground border border-indigo-500/30' : 'bg-red-600/20 text-foreground border border-red-500/30'}`}>
                    {direction === 'es-jp' ? '🇪🇸 Español' : '🇯🇵 Japonés'}
                  </div>
                </div>
                
                <Textarea
                  placeholder={direction === 'es-jp' ? 'Escribe algo en español...' : '日本語で書いてください...'}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={6}
                  className="bg-input border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
                />
              </div>

              {/* Output */}
              <div className="glass border border-border rounded-2xl p-6 shadow-xl">
                <div className="mb-4">
                  <label className="text-sm font-semibold text-foreground mb-3 block">Traducción</label>
                  <div className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors inline-block ${direction === 'jp-es' ? 'bg-indigo-600/20 text-foreground border border-indigo-500/30' : 'bg-red-600/20 text-foreground border border-red-500/30'}`}>
                    {direction === 'jp-es' ? '🇪🇸 Español' : '🇯🇵 Japonés'}
                  </div>
                </div>

                <div className="bg-input border border-border rounded-lg p-4 min-h-40 flex flex-col justify-between">
                  {translatedText ? (
                    <>
                      <div className="flex-1 whitespace-pre-wrap text-foreground">{translatedText}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(translatedText, 'translation')}
                        className="mt-3 self-end"
                      >
                        {copiedId === 'translation' ? (
                          <>
                            <Check className="w-4 h-4 mr-2 text-green-500" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2 text-stone-400" />
                            Copiar
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">Aquí aparecerá la traducción...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Button with switcher */}
            <div className="flex gap-3 items-center justify-center">
              <Button 
                onClick={handleTranslate}
                disabled={!inputText.trim() || isTranslating}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Traduciendo...
                  </>
                ) : (
                  <>
                    <Languages className="w-4 h-4 mr-2" />
                    Traducir
                  </>
                )}
              </Button>
              
              <button 
                onClick={() => setDirection(direction === 'es-jp' ? 'jp-es' : 'es-jp')}
                className="p-3 rounded-full border border-border glass hover:border-primary/50"
                title="Intercambiar idiomas"
              >
                <ArrowRightLeft className="w-5 h-5 text-primary" />
              </button>
            </div>
          </TabsContent>

          <TabsContent value="phrases" className="space-y-6">
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Busca por palabra, frase, romaji..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 glass border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
              />
            </div>

            {filteredCategories.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-lg">No se encontraron frases</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredCategories.map((category) => (
                  <Collapsible
                    key={category.name}
                    open={expandedCategories[category.name]}
                    onOpenChange={() => toggleCategory(category.name)}
                  >
                    <div className="glass border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-colors shadow-lg">
                      <CollapsibleTrigger className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-secondary/30 transition-colors">
                         <div className="flex items-center gap-4">
                           <span className="text-3xl">{category.icon}</span>
                           <div>
                             <span className="font-bold text-foreground text-lg">{category.name}</span>
                             <span className="text-xs text-muted-foreground ml-2">({category.phrases.length} frases)</span>
                          </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${expandedCategories[category.name] ? 'rotate-180' : ''}`} />
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="animate-in fade-in-50 slide-in-from-top-2 duration-300">
                        <div className="border-t border-border/50 divide-y divide-border/50 bg-secondary/10">
                          {category.phrases.map((phrase, idx) => (
                            <div key={idx} className="p-5 hover:bg-secondary/30 transition-colors group">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <p className="text-foreground font-semibold text-sm leading-tight">{phrase.spanish}</p>
                                  <p className="text-2xl font-bold mt-2 text-foreground tracking-tight">{phrase.japanese}</p>
                                  <p className="text-xs text-muted-foreground mt-2 italic font-mono bg-secondary/50 inline-block px-2 py-1 rounded">{phrase.romaji}</p>
                                </div>
                                <div className="flex-shrink-0 flex gap-2">
                                   <Button
                                     variant="ghost"
                                     size="icon"
                                     onClick={() => speakJapanese(phrase.japanese)}
                                     className="text-primary hover:text-primary/80"
                                     title="Escuchar pronunciación"
                                   >
                                     <Volume2 className="w-4 h-4" />
                                   </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => copyToClipboard(phrase.japanese, `${category.name}-${idx}`)}
                                  >
                                    {copiedId === `${category.name}-${idx}` ? (
                                      <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <Copy className="w-4 h-4 text-muted-foreground" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            )}
          </TabsContent>
                  </Tabs>
                </div>
                </div>
                );
                }