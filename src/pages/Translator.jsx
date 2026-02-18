import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Languages, ArrowRightLeft, Copy, Check, Volume2, Loader2, ChevronDown, Search } from 'lucide-react';
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

  const filteredCategories = phraseCategories.map(cat => ({
    ...cat,
    phrases: cat.phrases.filter(phrase => 
      phrase.spanish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phrase.japanese.includes(searchQuery) ||
      phrase.romaji.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.phrases.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
      <div className="max-w-5xl mx-auto px-6 py-12 pb-24">
        {/* Header */}
        <div className="mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-red-600/20 rounded-2xl blur-2xl -z-10" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-stone-100 to-stone-300 bg-clip-text text-transparent">Traductor 🌐</h1>
          <p className="text-stone-400 mt-2">Traduce y aprende frases útiles para tu viaje</p>
        </div>

        <Tabs defaultValue="translator" className="space-y-6">
          <TabsList className="bg-stone-800 border border-stone-700 p-1">
            <TabsTrigger value="phrases" className="text-stone-400 data-[state=active]:text-stone-100 data-[state=active]:bg-stone-700">
              📖 Frases útiles
            </TabsTrigger>
            <TabsTrigger value="translator" className="text-stone-400 data-[state=active]:text-stone-100 data-[state=active]:bg-stone-700">
              🔄 Traductor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="translator" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Input */}
              <div className="bg-gradient-to-br from-stone-800 to-stone-800/50 border border-stone-700 rounded-2xl p-6 shadow-xl">
                <div className="mb-4">
                  <label className="text-sm font-semibold text-stone-300 mb-3 block">Entrada</label>
                  <div className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors inline-block ${direction === 'es-jp' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'bg-red-600/20 text-red-300 border border-red-500/30'}`}>
                    {direction === 'es-jp' ? '🇪🇸 Español' : '🇯🇵 Japonés'}
                  </div>
                </div>
                
                <Textarea
                  placeholder={direction === 'es-jp' ? 'Escribe algo en español...' : '日本語で書いてください...'}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={6}
                  className="bg-stone-700/50 border border-stone-600 text-stone-100 placeholder:text-stone-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                />
              </div>

              {/* Output */}
              <div className="bg-gradient-to-br from-stone-800 to-stone-800/50 border border-stone-700 rounded-2xl p-6 shadow-xl">
                <div className="mb-4">
                  <label className="text-sm font-semibold text-stone-300 mb-3 block">Traducción</label>
                  <div className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors inline-block ${direction === 'jp-es' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'bg-red-600/20 text-red-300 border border-red-500/30'}`}>
                    {direction === 'jp-es' ? '🇪🇸 Español' : '🇯🇵 Japonés'}
                  </div>
                </div>

                <div className="bg-stone-700/50 border border-stone-600 rounded-lg p-4 min-h-40 flex flex-col justify-between">
                  {translatedText ? (
                    <>
                      <div className="flex-1 whitespace-pre-wrap text-stone-100">{translatedText}</div>
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
                    <p className="text-stone-400 text-sm">Aquí aparecerá la traducción...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Button with switcher */}
            <div className="flex gap-3 items-center justify-center">
              <Button 
                onClick={handleTranslate}
                disabled={!inputText.trim() || isTranslating}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-6 text-base"
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
                className="p-3 rounded-full border border-stone-600 bg-stone-800 hover:bg-stone-700 transition-all hover:border-indigo-500"
                title="Intercambiar idiomas"
              >
                <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
              </button>
            </div>
          </TabsContent>

          <TabsContent value="phrases" className="space-y-4">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
              <Input
                placeholder="Busca frases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-stone-800 border-stone-700 text-stone-100 placeholder:text-stone-500"
              />
            </div>
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12 text-stone-400">
                <Search className="w-12 h-12 mx-auto mb-3 text-stone-600" />
                <p>No se encontraron frases que coincidan con tu búsqueda</p>
              </div>
            ) : (
              <>
                {filteredCategories.map((category) => (
                  <Collapsible
                    key={category.name}
                    open={expandedCategories[category.name]}
                    onOpenChange={() => toggleCategory(category.name)}
                  >
                    <div className="bg-stone-800 backdrop-blur-xl border-2 border-stone-700 rounded-2xl overflow-hidden">
                      <CollapsibleTrigger className="w-full p-4 flex items-center justify-between text-left hover:bg-stone-700/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{category.icon}</span>
                          <span className="font-semibold text-stone-100">{category.name}</span>
                          <span className="text-sm text-stone-400">({category.phrases.length})</span>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform ${expandedCategories[category.name] ? 'rotate-180' : ''}`} />
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <div className="border-t border-stone-700 divide-y divide-stone-700">
                          {category.phrases.map((phrase, idx) => (
                            <div key={idx} className="p-4 hover:bg-stone-700/50 transition-colors">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <p className="text-stone-100 font-medium">{phrase.spanish}</p>
                                  <p className="text-xl mt-1 text-stone-200">{phrase.japanese}</p>
                                  <p className="text-sm text-stone-400 mt-0.5 italic">{phrase.romaji}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => copyToClipboard(phrase.japanese, `${category.name}-${idx}`)}
                                  className="flex-shrink-0"
                                >
                                  {copiedId === `${category.name}-${idx}` ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Copy className="w-4 h-4 text-stone-400" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                  ))}
                  </>
                  )}
                  </TabsContent>
                  </Tabs>
                </div>
                </div>
                );
                }