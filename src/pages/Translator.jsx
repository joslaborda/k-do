import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Languages, ArrowRightLeft, Copy, Check, Volume2, Loader2, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Traductor</h1>
          <p className="text-slate-500 mt-1">Traduce y aprende frases útiles para tu viaje</p>
        </div>

        <Tabs defaultValue="phrases" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1">
            <TabsTrigger value="phrases" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              📖 Frases útiles
            </TabsTrigger>
            <TabsTrigger value="translator" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              🔄 Traductor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="translator" className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${direction === 'es-jp' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  🇪🇸 Español
                </div>
                <button 
                  onClick={() => setDirection(direction === 'es-jp' ? 'jp-es' : 'es-jp')}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <ArrowRightLeft className="w-5 h-5 text-slate-500" />
                </button>
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${direction === 'jp-es' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  🇯🇵 Japonés
                </div>
              </div>

              <Textarea
                placeholder={direction === 'es-jp' ? 'Escribe en español...' : '日本語で書いてください... (o en romaji)'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={4}
                className="mb-4"
              />

              <Button 
                onClick={handleTranslate}
                disabled={!inputText.trim() || isTranslating}
                className="w-full bg-slate-900 hover:bg-slate-800"
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

              {translatedText && (
                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 whitespace-pre-wrap text-slate-700">{translatedText}</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(translatedText, 'translation')}
                      className="ml-2 flex-shrink-0"
                    >
                      {copiedId === 'translation' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="phrases" className="space-y-4">
            {phraseCategories.map((category) => (
              <Collapsible
                key={category.name}
                open={expandedCategories[category.name]}
                onOpenChange={() => toggleCategory(category.name)}
              >
                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                  <CollapsibleTrigger className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <span className="font-semibold text-slate-900">{category.name}</span>
                      <span className="text-sm text-slate-400">({category.phrases.length})</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedCategories[category.name] ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="border-t border-slate-100 divide-y divide-slate-50">
                      {category.phrases.map((phrase, idx) => (
                        <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-slate-900 font-medium">{phrase.spanish}</p>
                              <p className="text-xl mt-1">{phrase.japanese}</p>
                              <p className="text-sm text-slate-500 mt-0.5 italic">{phrase.romaji}</p>
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
                                <Copy className="w-4 h-4" />
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}