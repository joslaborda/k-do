// ─── Base de frases útiles hardcodeadas ──────────────────────────────────────
// Sin IA · Sin coste · Carga instantánea
// Para países hispanohablantes el Translator muestra mensaje de "mismo idioma"

function p(items) { return items; }

// ─── JAPONÉS ──────────────────────────────────────────────────────────────────
const JA = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"こんにちは",romanization:"Konnichiwa"},
    {source:"Buenos días",target:"おはようございます",romanization:"Ohayou gozaimasu"},
    {source:"Buenas noches",target:"こんばんは",romanization:"Konbanwa"},
    {source:"Gracias",target:"ありがとうございます",romanization:"Arigatou gozaimasu"},
    {source:"De nada",target:"どういたしまして",romanization:"Dou itashimashite"},
    {source:"Por favor",target:"お願いします",romanization:"Onegai shimasu"},
    {source:"Perdona",target:"すみません",romanization:"Sumimasen"},
    {source:"Sí",target:"はい",romanization:"Hai"},
    {source:"No",target:"いいえ",romanization:"Iie"},
    {source:"No entiendo",target:"わかりません",romanization:"Wakarimasen"},
    {source:"¿Cuánto cuesta?",target:"いくらですか？",romanization:"Ikura desu ka?"},
    {source:"Adiós",target:"さようなら",romanization:"Sayounara"},
  ])},
  { name:"Restaurante", items: p([
    {source:"Una mesa para dos",target:"二人です",romanization:"Futari desu"},
    {source:"La carta, por favor",target:"メニューをください",romanization:"Menyuu wo kudasai"},
    {source:"Esto, por favor",target:"これをください",romanization:"Kore wo kudasai"},
    {source:"La cuenta, por favor",target:"お会計をお願いします",romanization:"Okaikei wo onegai shimasu"},
    {source:"Agua, por favor",target:"水をください",romanization:"Mizu wo kudasai"},
    {source:"Sin picante",target:"辛くしないでください",romanization:"Karakunai de kudasai"},
    {source:"Soy vegetariano",target:"ベジタリアンです",romanization:"Bejitarian desu"},
    {source:"Sin gluten",target:"グルテンフリーです",romanization:"Guruten furii desu"},
    {source:"Alérgico a cacahuetes",target:"ピーナッツアレルギーです",romanization:"Piinattsu arerugii desu"},
    {source:"Está delicioso",target:"おいしいです",romanization:"Oishii desu"},
  ])},
  { name:"Direcciones", items: p([
    {source:"¿Dónde está el baño?",target:"トイレはどこですか？",romanization:"Toire wa doko desu ka?"},
    {source:"¿Dónde está la estación?",target:"駅はどこですか？",romanization:"Eki wa doko desu ka?"},
    {source:"Me he perdido",target:"迷子になりました",romanization:"Maigo ni narimashita"},
    {source:"Gira a la derecha",target:"右に曲がってください",romanization:"Migi ni magatte kudasai"},
    {source:"Gira a la izquierda",target:"左に曲がってください",romanization:"Hidari ni magatte kudasai"},
    {source:"Todo recto",target:"まっすぐ",romanization:"Massugu"},
    {source:"¿Está lejos?",target:"遠いですか？",romanization:"Tooi desu ka?"},
  ])},
  { name:"Transporte", items: p([
    {source:"Un billete para...",target:"...まで一枚",romanization:"...made ichimai"},
    {source:"Al aeropuerto",target:"空港まで",romanization:"Kuukou made"},
    {source:"¿Dónde está el metro?",target:"地下鉄はどこですか？",romanization:"Chikatetsu wa doko desu ka?"},
    {source:"Un taxi, por favor",target:"タクシーをお願いします",romanization:"Takushii wo onegai shimasu"},
    {source:"¿A qué hora sale?",target:"何時に出発しますか？",romanization:"Nanji ni shuppatsu shimasu ka?"},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"助けてください！",romanization:"Tasukete kudasai!"},
    {source:"Llama a la policía",target:"警察を呼んでください",romanization:"Keisatsu wo yonde kudasai"},
    {source:"Necesito un médico",target:"医者が必要です",romanization:"Isha ga hitsuyou desu"},
    {source:"¿Dónde está el hospital?",target:"病院はどこですか？",romanization:"Byouin wa doko desu ka?"},
    {source:"Me han robado",target:"盗まれました",romanization:"Nusumaremashita"},
    {source:"He perdido el pasaporte",target:"パスポートをなくしました",romanization:"Pasupooto wo nakushimashita"},
  ])},
];

// ─── FRANCÉS ─────────────────────────────────────────────────────────────────
const FR = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Bonjour",romanization:null},
    {source:"Buenos días",target:"Bonjour",romanization:null},
    {source:"Buenas noches",target:"Bonsoir",romanization:null},
    {source:"Gracias",target:"Merci",romanization:null},
    {source:"De nada",target:"De rien",romanization:null},
    {source:"Por favor",target:"S'il vous plaît",romanization:null},
    {source:"Perdona",target:"Excusez-moi",romanization:null},
    {source:"Sí / No",target:"Oui / Non",romanization:null},
    {source:"No entiendo",target:"Je ne comprends pas",romanization:null},
    {source:"¿Cuánto cuesta?",target:"Combien ça coûte?",romanization:null},
    {source:"Adiós",target:"Au revoir",romanization:null},
  ])},
  { name:"Restaurante", items: p([
    {source:"Una mesa para dos",target:"Une table pour deux",romanization:null},
    {source:"La carta",target:"La carte, s'il vous plaît",romanization:null},
    {source:"La cuenta",target:"L'addition, s'il vous plaît",romanization:null},
    {source:"Agua",target:"De l'eau, s'il vous plaît",romanization:null},
    {source:"Soy vegetariano",target:"Je suis végétarien",romanization:null},
    {source:"Sin gluten",target:"Sans gluten",romanization:null},
    {source:"Está delicioso",target:"C'est délicieux",romanization:null},
    {source:"Soy alérgico a...",target:"Je suis allergique à...",romanization:null},
  ])},
  { name:"Direcciones", items: p([
    {source:"¿Dónde está el baño?",target:"Où sont les toilettes?",romanization:null},
    {source:"Gira a la derecha",target:"Tournez à droite",romanization:null},
    {source:"Gira a la izquierda",target:"Tournez à gauche",romanization:null},
    {source:"Todo recto",target:"Tout droit",romanization:null},
    {source:"Me he perdido",target:"Je me suis perdu",romanization:null},
  ])},
  { name:"Transporte", items: p([
    {source:"Al aeropuerto",target:"À l'aéroport",romanization:null},
    {source:"Un billete para...",target:"Un billet pour...",romanization:null},
    {source:"¿A qué hora sale?",target:"À quelle heure part-il?",romanization:null},
    {source:"Un taxi, por favor",target:"Un taxi, s'il vous plaît",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Au secours!",romanization:null},
    {source:"Llama a la policía",target:"Appelez la police",romanization:null},
    {source:"Necesito un médico",target:"J'ai besoin d'un médecin",romanization:null},
    {source:"¿Dónde está el hospital?",target:"Où est l'hôpital?",romanization:null},
    {source:"Me han robado",target:"On m'a volé",romanization:null},
    {source:"He perdido el pasaporte",target:"J'ai perdu mon passeport",romanization:null},
  ])},
];

// ─── ALEMÁN ───────────────────────────────────────────────────────────────────
const DE = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Hallo",romanization:null},
    {source:"Buenos días",target:"Guten Morgen",romanization:null},
    {source:"Buenas noches",target:"Guten Abend",romanization:null},
    {source:"Gracias",target:"Danke schön",romanization:null},
    {source:"De nada",target:"Bitte",romanization:null},
    {source:"Por favor",target:"Bitte",romanization:null},
    {source:"Perdona",target:"Entschuldigung",romanization:null},
    {source:"Sí / No",target:"Ja / Nein",romanization:null},
    {source:"No entiendo",target:"Ich verstehe nicht",romanization:null},
    {source:"¿Cuánto cuesta?",target:"Was kostet das?",romanization:null},
    {source:"Adiós",target:"Auf Wiedersehen",romanization:null},
  ])},
  { name:"Restaurante", items: p([
    {source:"Una mesa para dos",target:"Einen Tisch für zwei, bitte",romanization:null},
    {source:"La carta",target:"Die Speisekarte, bitte",romanization:null},
    {source:"La cuenta",target:"Die Rechnung, bitte",romanization:null},
    {source:"Agua",target:"Wasser, bitte",romanization:null},
    {source:"Soy vegetariano",target:"Ich bin Vegetarier",romanization:null},
    {source:"Sin gluten",target:"Glutenfrei",romanization:null},
    {source:"Está delicioso",target:"Es ist köstlich",romanization:null},
    {source:"Soy alérgico a...",target:"Ich bin allergisch gegen...",romanization:null},
  ])},
  { name:"Direcciones", items: p([
    {source:"¿Dónde está el baño?",target:"Wo ist die Toilette?",romanization:null},
    {source:"Gira a la derecha",target:"Biegen Sie rechts ab",romanization:null},
    {source:"Gira a la izquierda",target:"Biegen Sie links ab",romanization:null},
    {source:"Todo recto",target:"Geradeaus",romanization:null},
    {source:"Me he perdido",target:"Ich habe mich verirrt",romanization:null},
  ])},
  { name:"Transporte", items: p([
    {source:"Al aeropuerto",target:"Zum Flughafen",romanization:null},
    {source:"Un billete para...",target:"Eine Fahrkarte nach...",romanization:null},
    {source:"¿A qué hora sale?",target:"Wann fährt es ab?",romanization:null},
    {source:"Un taxi, por favor",target:"Ein Taxi, bitte",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Hilfe!",romanization:null},
    {source:"Llama a la policía",target:"Rufen Sie die Polizei",romanization:null},
    {source:"Necesito un médico",target:"Ich brauche einen Arzt",romanization:null},
    {source:"¿Dónde está el hospital?",target:"Wo ist das Krankenhaus?",romanization:null},
    {source:"Me han robado",target:"Ich wurde bestohlen",romanization:null},
    {source:"He perdido el pasaporte",target:"Ich habe meinen Pass verloren",romanization:null},
  ])},
];

// ─── ITALIANO ─────────────────────────────────────────────────────────────────
const IT = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Ciao / Salve",romanization:null},
    {source:"Buenos días",target:"Buongiorno",romanization:null},
    {source:"Buenas noches",target:"Buonasera",romanization:null},
    {source:"Gracias",target:"Grazie",romanization:null},
    {source:"De nada",target:"Prego",romanization:null},
    {source:"Por favor",target:"Per favore",romanization:null},
    {source:"Perdona",target:"Scusi",romanization:null},
    {source:"Sí / No",target:"Sì / No",romanization:null},
    {source:"No entiendo",target:"Non capisco",romanization:null},
    {source:"¿Cuánto cuesta?",target:"Quanto costa?",romanization:null},
    {source:"Adiós",target:"Arrivederci",romanization:null},
  ])},
  { name:"Restaurante", items: p([
    {source:"Una mesa para dos",target:"Un tavolo per due, per favore",romanization:null},
    {source:"La carta",target:"Il menù, per favore",romanization:null},
    {source:"La cuenta",target:"Il conto, per favore",romanization:null},
    {source:"Agua",target:"Acqua, per favore",romanization:null},
    {source:"Soy vegetariano",target:"Sono vegetariano",romanization:null},
    {source:"Sin gluten",target:"Senza glutine",romanization:null},
    {source:"Está delicioso",target:"È delizioso",romanization:null},
    {source:"Soy alérgico a...",target:"Sono allergico a...",romanization:null},
  ])},
  { name:"Direcciones", items: p([
    {source:"¿Dónde está el baño?",target:"Dov'è il bagno?",romanization:null},
    {source:"Gira a la derecha",target:"Gira a destra",romanization:null},
    {source:"Gira a la izquierda",target:"Gira a sinistra",romanization:null},
    {source:"Todo recto",target:"Sempre dritto",romanization:null},
    {source:"Me he perdido",target:"Mi sono perso",romanization:null},
  ])},
  { name:"Transporte", items: p([
    {source:"Al aeropuerto",target:"All'aeroporto",romanization:null},
    {source:"Un billete para...",target:"Un biglietto per...",romanization:null},
    {source:"¿A qué hora sale?",target:"A che ora parte?",romanization:null},
    {source:"Un taxi, por favor",target:"Un taxi, per favore",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Aiuto!",romanization:null},
    {source:"Llama a la policía",target:"Chiama la polizia",romanization:null},
    {source:"Necesito un médico",target:"Ho bisogno di un medico",romanization:null},
    {source:"¿Dónde está el hospital?",target:"Dov'è l'ospedale?",romanization:null},
    {source:"Me han robado",target:"Mi hanno derubato",romanization:null},
    {source:"He perdido el pasaporte",target:"Ho perso il passaporto",romanization:null},
  ])},
];

// ─── PORTUGUÉS ────────────────────────────────────────────────────────────────
const PT = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Olá",romanization:null},
    {source:"Buenos días",target:"Bom dia",romanization:null},
    {source:"Buenas noches",target:"Boa noite",romanization:null},
    {source:"Gracias",target:"Obrigado / Obrigada",romanization:null},
    {source:"De nada",target:"De nada",romanization:null},
    {source:"Por favor",target:"Por favor",romanization:null},
    {source:"Perdona",target:"Com licença / Desculpe",romanization:null},
    {source:"Sí / No",target:"Sim / Não",romanization:null},
    {source:"No entiendo",target:"Não entendo",romanization:null},
    {source:"¿Cuánto cuesta?",target:"Quanto custa?",romanization:null},
    {source:"Adiós",target:"Tchau / Adeus",romanization:null},
  ])},
  { name:"Restaurante", items: p([
    {source:"Una mesa para dos",target:"Uma mesa para dois, por favor",romanization:null},
    {source:"La carta",target:"O cardápio, por favor",romanization:null},
    {source:"La cuenta",target:"A conta, por favor",romanization:null},
    {source:"Agua",target:"Água, por favor",romanization:null},
    {source:"Soy vegetariano",target:"Sou vegetariano",romanization:null},
    {source:"Sin gluten",target:"Sem glúten",romanization:null},
    {source:"Está delicioso",target:"Está delicioso",romanization:null},
  ])},
  { name:"Direcciones", items: p([
    {source:"¿Dónde está el baño?",target:"Onde fica o banheiro?",romanization:null},
    {source:"Gira a la derecha",target:"Vire à direita",romanization:null},
    {source:"Gira a la izquierda",target:"Vire à esquerda",romanization:null},
    {source:"Todo recto",target:"Siga em frente",romanization:null},
    {source:"Me he perdido",target:"Estou perdido",romanization:null},
  ])},
  { name:"Transporte", items: p([
    {source:"Al aeropuerto",target:"Para o aeroporto",romanization:null},
    {source:"Un billete para...",target:"Uma passagem para...",romanization:null},
    {source:"¿A qué hora sale?",target:"A que horas sai?",romanization:null},
    {source:"Un taxi, por favor",target:"Um táxi, por favor",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Socorro!",romanization:null},
    {source:"Llama a la policía",target:"Chame a polícia",romanization:null},
    {source:"Necesito un médico",target:"Preciso de um médico",romanization:null},
    {source:"¿Dónde está el hospital?",target:"Onde fica o hospital?",romanization:null},
    {source:"Me han robado",target:"Fui roubado",romanization:null},
    {source:"He perdido el pasaporte",target:"Perdi o meu passaporte",romanization:null},
  ])},
];

// ─── INGLÉS ───────────────────────────────────────────────────────────────────
const EN = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Hello",romanization:null},
    {source:"Buenos días",target:"Good morning",romanization:null},
    {source:"Buenas noches",target:"Good evening",romanization:null},
    {source:"Gracias",target:"Thank you",romanization:null},
    {source:"De nada",target:"You're welcome",romanization:null},
    {source:"Por favor",target:"Please",romanization:null},
    {source:"Perdona",target:"Excuse me / Sorry",romanization:null},
    {source:"Sí / No",target:"Yes / No",romanization:null},
    {source:"No entiendo",target:"I don't understand",romanization:null},
    {source:"¿Cuánto cuesta?",target:"How much is it?",romanization:null},
    {source:"Adiós",target:"Goodbye",romanization:null},
  ])},
  { name:"Restaurante", items: p([
    {source:"Una mesa para dos",target:"A table for two, please",romanization:null},
    {source:"La carta",target:"The menu, please",romanization:null},
    {source:"La cuenta",target:"The bill, please",romanization:null},
    {source:"Agua",target:"Water, please",romanization:null},
    {source:"Soy vegetariano",target:"I'm vegetarian",romanization:null},
    {source:"Sin gluten",target:"Gluten-free",romanization:null},
    {source:"Está delicioso",target:"It's delicious",romanization:null},
    {source:"Soy alérgico a...",target:"I'm allergic to...",romanization:null},
  ])},
  { name:"Direcciones", items: p([
    {source:"¿Dónde está el baño?",target:"Where is the bathroom?",romanization:null},
    {source:"Gira a la derecha",target:"Turn right",romanization:null},
    {source:"Gira a la izquierda",target:"Turn left",romanization:null},
    {source:"Todo recto",target:"Straight ahead",romanization:null},
    {source:"Me he perdido",target:"I'm lost",romanization:null},
  ])},
  { name:"Transporte", items: p([
    {source:"Al aeropuerto",target:"To the airport",romanization:null},
    {source:"Un billete para...",target:"A ticket to...",romanization:null},
    {source:"¿A qué hora sale?",target:"What time does it leave?",romanization:null},
    {source:"Un taxi, por favor",target:"A taxi, please",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Help!",romanization:null},
    {source:"Llama a la policía",target:"Call the police",romanization:null},
    {source:"Necesito un médico",target:"I need a doctor",romanization:null},
    {source:"¿Dónde está el hospital?",target:"Where is the hospital?",romanization:null},
    {source:"Me han robado",target:"I've been robbed",romanization:null},
    {source:"He perdido el pasaporte",target:"I've lost my passport",romanization:null},
  ])},
];

// ─── ÁRABE ────────────────────────────────────────────────────────────────────
const AR = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"مرحباً",romanization:"Marhaban"},
    {source:"Buenos días",target:"صباح الخير",romanization:"Sabah al-khair"},
    {source:"Buenas noches",target:"مساء الخير",romanization:"Masa al-khair"},
    {source:"Gracias",target:"شكراً",romanization:"Shukran"},
    {source:"De nada",target:"عفواً",romanization:"Afwan"},
    {source:"Por favor",target:"من فضلك",romanization:"Min fadlik"},
    {source:"Perdona",target:"آسف",romanization:"Asif"},
    {source:"Sí / No",target:"نعم / لا",romanization:"Na'am / La"},
    {source:"No entiendo",target:"لا أفهم",romanization:"La afham"},
    {source:"¿Cuánto cuesta?",target:"كم يكلف؟",romanization:"Kam yukalif?"},
    {source:"Adiós",target:"مع السلامة",romanization:"Ma'a as-salama"},
  ])},
  { name:"Restaurante", items: p([
    {source:"La carta",target:"القائمة من فضلك",romanization:"Al-qa'ima min fadlik"},
    {source:"La cuenta",target:"الحساب من فضلك",romanization:"Al-hisab min fadlik"},
    {source:"Agua",target:"ماء",romanization:"Ma'"},
    {source:"Sin picante",target:"بدون حار",romanization:"Bidun harr"},
    {source:"Sin cerdo",target:"بدون لحم خنزير",romanization:"Bidun lahm khinzir"},
    {source:"Soy vegetariano",target:"أنا نباتي",romanization:"Ana nabati"},
    {source:"Está delicioso",target:"إنه لذيذ",romanization:"Innahu ladhidh"},
  ])},
  { name:"Direcciones", items: p([
    {source:"¿Dónde está el baño?",target:"أين الحمام؟",romanization:"Ayna al-hammam?"},
    {source:"Gira a la derecha",target:"اتجه يميناً",romanization:"Ittajah yameenan"},
    {source:"Gira a la izquierda",target:"اتجه يساراً",romanization:"Ittajah yasaran"},
    {source:"Todo recto",target:"اذهب مستقيماً",romanization:"Idhhab mustaqiman"},
    {source:"Me he perdido",target:"لقد ضللت طريقي",romanization:"Laqad dalaltu tariqee"},
  ])},
  { name:"Transporte", items: p([
    {source:"Al aeropuerto",target:"إلى المطار",romanization:"Ila al-matar"},
    {source:"Un billete para...",target:"تذكرة إلى...",romanization:"Tadhkara ila..."},
    {source:"Un taxi, por favor",target:"سيارة أجرة من فضلك",romanization:"Sayyarat ujra min fadlik"},
    {source:"¿A qué hora sale?",target:"متى يغادر؟",romanization:"Mata yughadir?"},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"النجدة!",romanization:"An-najda!"},
    {source:"Llama a la policía",target:"اتصل بالشرطة",romanization:"Ittasil bish-shurta"},
    {source:"Necesito un médico",target:"أحتاج إلى طبيب",romanization:"Ahtaj ila tabib"},
    {source:"¿Dónde está el hospital?",target:"أين المستشفى؟",romanization:"Ayna al-mustashfa?"},
    {source:"Me han robado",target:"لقد سُرقت",romanization:"Laqad suriQt"},
    {source:"He perdido el pasaporte",target:"فقدت جواز سفري",romanization:"Faqadtu jawaz safari"},
  ])},
];

// ─── CHINO ────────────────────────────────────────────────────────────────────
const ZH = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"你好",romanization:"Nǐ hǎo"},
    {source:"Buenos días",target:"早上好",romanization:"Zǎoshang hǎo"},
    {source:"Buenas noches",target:"晚上好",romanization:"Wǎnshang hǎo"},
    {source:"Gracias",target:"谢谢",romanization:"Xièxiè"},
    {source:"De nada",target:"不客气",romanization:"Bú kèqì"},
    {source:"Por favor",target:"请",romanization:"Qǐng"},
    {source:"Perdona",target:"对不起",romanization:"Duìbuqǐ"},
    {source:"Sí / No",target:"是 / 不是",romanization:"Shì / Bù shì"},
    {source:"No entiendo",target:"我不明白",romanization:"Wǒ bù míngbái"},
    {source:"¿Cuánto cuesta?",target:"多少钱？",romanization:"Duōshǎo qián?"},
    {source:"Adiós",target:"再见",romanization:"Zàijiàn"},
  ])},
  { name:"Restaurante", items: p([
    {source:"La carta",target:"菜单，请",romanization:"Càidān, qǐng"},
    {source:"La cuenta",target:"买单",romanization:"Mǎidān"},
    {source:"Agua",target:"水",romanization:"Shuǐ"},
    {source:"Sin picante",target:"不要辣",romanization:"Bùyào là"},
    {source:"Soy vegetariano",target:"我吃素",romanization:"Wǒ chī sù"},
    {source:"Está delicioso",target:"很好吃",romanization:"Hěn hǎochī"},
    {source:"Sin marisco",target:"不要海鲜",romanization:"Bùyào hǎixiān"},
  ])},
  { name:"Direcciones", items: p([
    {source:"¿Dónde está el baño?",target:"厕所在哪里？",romanization:"Cèsuǒ zài nǎlǐ?"},
    {source:"Gira a la derecha",target:"向右转",romanization:"Xiàng yòu zhuǎn"},
    {source:"Gira a la izquierda",target:"向左转",romanization:"Xiàng zuǒ zhuǎn"},
    {source:"Todo recto",target:"直走",romanization:"Zhí zǒu"},
    {source:"Me he perdido",target:"我迷路了",romanization:"Wǒ mí lù le"},
  ])},
  { name:"Transporte", items: p([
    {source:"Al aeropuerto",target:"去机场",romanization:"Qù jīchǎng"},
    {source:"Un billete para...",target:"一张去...的票",romanization:"Yī zhāng qù...de piào"},
    {source:"¿Dónde está el metro?",target:"地铁在哪里？",romanization:"Dìtiě zài nǎlǐ?"},
    {source:"Un taxi, por favor",target:"打车",romanization:"Dǎ chē"},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"救命！",romanization:"Jiùmìng!"},
    {source:"Llama a la policía",target:"叫警察",romanization:"Jiào jǐngchá"},
    {source:"Necesito un médico",target:"我需要医生",romanization:"Wǒ xūyào yīshēng"},
    {source:"¿Dónde está el hospital?",target:"医院在哪里？",romanization:"Yīyuàn zài nǎlǐ?"},
    {source:"Me han robado",target:"我被偷了",romanization:"Wǒ bèi tōu le"},
    {source:"He perdido el pasaporte",target:"我丢了护照",romanization:"Wǒ diū le hùzhào"},
  ])},
];

// ─── COREANO ──────────────────────────────────────────────────────────────────
const KO = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"안녕하세요",romanization:"Annyeonghaseyo"},
    {source:"Buenos días",target:"좋은 아침이에요",romanization:"Joheun achimieyo"},
    {source:"Gracias",target:"감사합니다",romanization:"Gamsahamnida"},
    {source:"De nada",target:"천만에요",romanization:"Cheonmaneyo"},
    {source:"Por favor",target:"부탁드립니다",romanization:"Butakdeurimnida"},
    {source:"Perdona",target:"죄송합니다",romanization:"Joesonghamnida"},
    {source:"Sí / No",target:"네 / 아니요",romanization:"Ne / Aniyo"},
    {source:"No entiendo",target:"모르겠어요",romanization:"Moreugesseoyo"},
    {source:"¿Cuánto cuesta?",target:"얼마예요?",romanization:"Eolmayeyo?"},
    {source:"Adiós",target:"안녕히 가세요",romanization:"Annyeonghi gaseyo"},
  ])},
  { name:"Restaurante", items: p([
    {source:"La carta",target:"메뉴판 주세요",romanization:"Menyupan juseyo"},
    {source:"La cuenta",target:"계산서 주세요",romanization:"Gyesanseo juseyo"},
    {source:"Agua",target:"물 주세요",romanization:"Mul juseyo"},
    {source:"Sin picante",target:"안 맵게 해주세요",romanization:"An maepge haejuseyo"},
    {source:"Está delicioso",target:"맛있어요",romanization:"Massisseoyo"},
    {source:"Esto, por favor",target:"이거 주세요",romanization:"Igeo juseyo"},
    {source:"Soy vegetariano",target:"채식주의자예요",romanization:"Chaesigjuuijayeyo"},
  ])},
  { name:"Direcciones", items: p([
    {source:"¿Dónde está el baño?",target:"화장실이 어디예요?",romanization:"Hwajangsili eodiyeyo?"},
    {source:"Gira a la derecha",target:"오른쪽으로 가세요",romanization:"Oreunjjogeuro gaseyo"},
    {source:"Gira a la izquierda",target:"왼쪽으로 가세요",romanization:"Oenjjogeuro gaseyo"},
    {source:"Todo recto",target:"직진하세요",romanization:"Jikjinhaseyo"},
    {source:"Me he perdido",target:"길을 잃었어요",romanization:"Gireul irheosseoyo"},
  ])},
  { name:"Transporte", items: p([
    {source:"Al aeropuerto",target:"공항으로 가주세요",romanization:"Gonghanguro gajuseyo"},
    {source:"Un billete para...",target:"...까지 한 장 주세요",romanization:"...kkaji han jang juseyo"},
    {source:"¿Dónde está el metro?",target:"지하철역이 어디예요?",romanization:"Jihacheoryeogi eodiyeyo?"},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"도와주세요!",romanization:"Dowajuseyo!"},
    {source:"Llama a la policía",target:"경찰을 불러주세요",romanization:"Gyeongchareul bulleojuseyo"},
    {source:"Necesito un médico",target:"의사가 필요해요",romanization:"Uisaga piryohaeyo"},
    {source:"¿Dónde está el hospital?",target:"병원이 어디예요?",romanization:"Byeongwoni eodiyeyo?"},
    {source:"Me han robado",target:"도둑맞았어요",romanization:"Dodungmajasseoyo"},
  ])},
];

// ─── TAILANDÉS ────────────────────────────────────────────────────────────────
const TH = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"สวัสดี",romanization:"Sawasdee"},
    {source:"Gracias",target:"ขอบคุณ",romanization:"Khob khun"},
    {source:"Por favor",target:"กรุณา",romanization:"Garuna"},
    {source:"Perdona",target:"ขอโทษ",romanization:"Kho thot"},
    {source:"Sí / No",target:"ใช่ / ไม่",romanization:"Chai / Mai"},
    {source:"No entiendo",target:"ไม่เข้าใจ",romanization:"Mai khao jai"},
    {source:"¿Cuánto cuesta?",target:"ราคาเท่าไหร่?",romanization:"Raka thao rai?"},
    {source:"Adiós",target:"ลาก่อน",romanization:"La kon"},
  ])},
  { name:"Restaurante", items: p([
    {source:"La carta",target:"เมนูหน่อยครับ",romanization:"Menu noi khrab"},
    {source:"La cuenta",target:"เก็บเงินด้วย",romanization:"Gep ngern duay"},
    {source:"Agua",target:"น้ำเปล่า",romanization:"Nam plao"},
    {source:"Sin picante",target:"ไม่เผ็ด",romanization:"Mai phet"},
    {source:"Muy picante",target:"เผ็ดมาก",romanization:"Phet mak"},
    {source:"Está delicioso",target:"อร่อยมาก",romanization:"Aroi mak"},
    {source:"Soy vegetariano",target:"ฉันกินเจ",romanization:"Chan kin jay"},
  ])},
  { name:"Direcciones", items: p([
    {source:"¿Dónde está el baño?",target:"ห้องน้ำอยู่ที่ไหน?",romanization:"Hong nam yu thi nai?"},
    {source:"Gira a la derecha",target:"เลี้ยวขวา",romanization:"Liao khwa"},
    {source:"Gira a la izquierda",target:"เลี้ยวซ้าย",romanization:"Liao sai"},
    {source:"Todo recto",target:"ตรงไป",romanization:"Trong pai"},
    {source:"Me he perdido",target:"ฉันหลงทาง",romanization:"Chan long tang"},
  ])},
  { name:"Transporte", items: p([
    {source:"Al aeropuerto",target:"ไปสนามบิน",romanization:"Pai sanam bin"},
    {source:"Un taxi, por favor",target:"เรียกแท็กซี่",romanization:"Riak taxi"},
    {source:"¿Cuánto cuesta el tuk-tuk?",target:"ตุ๊กตุ๊กราคาเท่าไหร่?",romanization:"Tuk tuk raka thao rai?"},
    {source:"Para aquí",target:"จอดตรงนี้",romanization:"Jod trong ni"},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"ช่วยด้วย!",romanization:"Chuay duay!"},
    {source:"Llama a la policía",target:"โทรตำรวจ",romanization:"Tho tamruat"},
    {source:"Necesito un médico",target:"ต้องการหมอ",romanization:"Tong kan mo"},
    {source:"¿Dónde está el hospital?",target:"โรงพยาบาลอยู่ที่ไหน?",romanization:"Rong phayaban yu thi nai?"},
  ])},
];

// ─── VIETNAMITA ───────────────────────────────────────────────────────────────
const VI = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Xin chào",romanization:null},
    {source:"Gracias",target:"Cảm ơn",romanization:null},
    {source:"Por favor",target:"Làm ơn",romanization:null},
    {source:"Perdona",target:"Xin lỗi",romanization:null},
    {source:"Sí / No",target:"Vâng / Không",romanization:null},
    {source:"No entiendo",target:"Tôi không hiểu",romanization:null},
    {source:"¿Cuánto cuesta?",target:"Bao nhiêu tiền?",romanization:null},
    {source:"Adiós",target:"Tạm biệt",romanization:null},
  ])},
  { name:"Restaurante", items: p([
    {source:"La carta",target:"Cho tôi xem thực đơn",romanization:null},
    {source:"La cuenta",target:"Tính tiền",romanization:null},
    {source:"Agua",target:"Nước lọc",romanization:null},
    {source:"Sin picante",target:"Không cay",romanization:null},
    {source:"Está delicioso",target:"Rất ngon",romanization:null},
    {source:"Soy vegetariano",target:"Tôi ăn chay",romanization:null},
  ])},
  { name:"Direcciones", items: p([
    {source:"¿Dónde está el baño?",target:"Nhà vệ sinh ở đâu?",romanization:null},
    {source:"Gira a la derecha",target:"Rẽ phải",romanization:null},
    {source:"Gira a la izquierda",target:"Rẽ trái",romanization:null},
    {source:"Todo recto",target:"Đi thẳng",romanization:null},
    {source:"Me he perdido",target:"Tôi bị lạc",romanization:null},
  ])},
  { name:"Transporte", items: p([
    {source:"Al aeropuerto",target:"Ra sân bay",romanization:null},
    {source:"Un taxi, por favor",target:"Gọi taxi giúp tôi",romanization:null},
    {source:"¿A qué hora sale?",target:"Mấy giờ khởi hành?",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Cứu tôi với!",romanization:null},
    {source:"Llama a la policía",target:"Gọi cảnh sát",romanization:null},
    {source:"Necesito un médico",target:"Tôi cần bác sĩ",romanization:null},
    {source:"¿Dónde está el hospital?",target:"Bệnh viện ở đâu?",romanization:null},
  ])},
];

// ─── INDONESIO / MALAYO ───────────────────────────────────────────────────────
const ID = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Halo",romanization:null},
    {source:"Buenos días",target:"Selamat pagi",romanization:null},
    {source:"Buenas noches",target:"Selamat malam",romanization:null},
    {source:"Gracias",target:"Terima kasih",romanization:null},
    {source:"De nada",target:"Sama-sama",romanization:null},
    {source:"Por favor",target:"Tolong",romanization:null},
    {source:"Perdona",target:"Maaf",romanization:null},
    {source:"Sí / No",target:"Ya / Tidak",romanization:null},
    {source:"No entiendo",target:"Saya tidak mengerti",romanization:null},
    {source:"¿Cuánto cuesta?",target:"Berapa harganya?",romanization:null},
    {source:"Adiós",target:"Selamat tinggal",romanization:null},
  ])},
  { name:"Restaurante", items: p([
    {source:"La carta",target:"Menunya, tolong",romanization:null},
    {source:"La cuenta",target:"Minta bon",romanization:null},
    {source:"Agua",target:"Air minum",romanization:null},
    {source:"Sin picante",target:"Tidak pedas",romanization:null},
    {source:"Está delicioso",target:"Enak sekali",romanization:null},
    {source:"Soy vegetariano",target:"Saya vegetarian",romanization:null},
  ])},
  { name:"Direcciones", items: p([
    {source:"¿Dónde está el baño?",target:"Di mana kamar mandi?",romanization:null},
    {source:"Gira a la derecha",target:"Belok kanan",romanization:null},
    {source:"Gira a la izquierda",target:"Belok kiri",romanization:null},
    {source:"Todo recto",target:"Lurus terus",romanization:null},
    {source:"Me he perdido",target:"Saya tersesat",romanization:null},
  ])},
  { name:"Transporte", items: p([
    {source:"Al aeropuerto",target:"Ke bandara",romanization:null},
    {source:"Un taxi, por favor",target:"Tolong panggilkan taksi",romanization:null},
    {source:"¿Cuánto cuesta?",target:"Berapa ongkosnya?",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Tolong!",romanization:null},
    {source:"Llama a la policía",target:"Panggil polisi",romanization:null},
    {source:"Necesito un médico",target:"Saya butuh dokter",romanization:null},
    {source:"¿Dónde está el hospital?",target:"Di mana rumah sakit?",romanization:null},
    {source:"Me han robado",target:"Saya dirampok",romanization:null},
  ])},
];

// ─── GRIEGO ───────────────────────────────────────────────────────────────────
const EL = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Γεια σας",romanization:"Yia sas"},
    {source:"Buenos días",target:"Καλημέρα",romanization:"Kalimera"},
    {source:"Buenas noches",target:"Καλησπέρα",romanization:"Kalispera"},
    {source:"Gracias",target:"Ευχαριστώ",romanization:"Efharistó"},
    {source:"De nada",target:"Παρακαλώ",romanization:"Parakaló"},
    {source:"Por favor",target:"Παρακαλώ",romanization:"Parakaló"},
    {source:"Perdona",target:"Συγγνώμη",romanization:"Signómi"},
    {source:"Sí / No",target:"Ναι / Όχι",romanization:"Ne / Óhi"},
    {source:"No entiendo",target:"Δεν καταλαβαίνω",romanization:"Den katalaveino"},
    {source:"¿Cuánto cuesta?",target:"Πόσο κάνει;",romanization:"Póso káni?"},
    {source:"Adiós",target:"Αντίο",romanization:"Andío"},
  ])},
  { name:"Restaurante", items: p([
    {source:"La carta",target:"Τον κατάλογο, παρακαλώ",romanization:"Ton katálogo, parakaló"},
    {source:"La cuenta",target:"Τον λογαριασμό, παρακαλώ",romanization:"Ton logariasmó, parakaló"},
    {source:"Agua",target:"Νερό, παρακαλώ",romanization:"Neró, parakaló"},
    {source:"Está delicioso",target:"Είναι πολύ νόστιμο",romanization:"Ine poli nóstimo"},
    {source:"Soy vegetariano",target:"Είμαι χορτοφάγος",romanization:"Ime hortofágos"},
    {source:"Sin gluten",target:"Χωρίς γλουτένη",romanization:"Horis gluténi"},
  ])},
  { name:"Direcciones", items: p([
    {source:"¿Dónde está el baño?",target:"Πού είναι η τουαλέτα;",romanization:"Pu ine i toualéta?"},
    {source:"Gira a la derecha",target:"Στρίψτε δεξιά",romanization:"Strípste dexiá"},
    {source:"Gira a la izquierda",target:"Στρίψτε αριστερά",romanization:"Strípste aristerá"},
    {source:"Todo recto",target:"Ευθεία",romanization:"Efthía"},
    {source:"Me he perdido",target:"Έχω χαθεί",romanization:"Eho hathí"},
  ])},
  { name:"Transporte", items: p([
    {source:"Al aeropuerto",target:"Στο αεροδρόμιο",romanization:"Sto aerodhrómio"},
    {source:"Un billete para...",target:"Ένα εισιτήριο για...",romanization:"Ena eisitírio ya..."},
    {source:"Un taxi, por favor",target:"Ένα ταξί, παρακαλώ",romanization:"Ena taxí, parakaló"},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Βοήθεια!",romanization:"Voíthia!"},
    {source:"Llama a la policía",target:"Καλέστε την αστυνομία",romanization:"Kaléste tin astinomía"},
    {source:"Necesito un médico",target:"Χρειάζομαι γιατρό",romanization:"Hriázome yiatró"},
    {source:"¿Dónde está el hospital?",target:"Πού είναι το νοσοκομείο;",romanization:"Pu ine to nosokomío?"},
  ])},
];

// ─── TURCO ────────────────────────────────────────────────────────────────────
const TR = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Merhaba",romanization:null},
    {source:"Buenos días",target:"Günaydın",romanization:null},
    {source:"Buenas noches",target:"İyi akşamlar",romanization:null},
    {source:"Gracias",target:"Teşekkür ederim",romanization:null},
    {source:"De nada",target:"Rica ederim",romanization:null},
    {source:"Por favor",target:"Lütfen",romanization:null},
    {source:"Perdona",target:"Özür dilerim",romanization:null},
    {source:"Sí / No",target:"Evet / Hayır",romanization:null},
    {source:"No entiendo",target:"Anlamıyorum",romanization:null},
    {source:"¿Cuánto cuesta?",target:"Bu kaç para?",romanization:null},
    {source:"Adiós",target:"Hoşça kalın",romanization:null},
  ])},
  { name:"Restaurante", items: p([
    {source:"La carta",target:"Menü lütfen",romanization:null},
    {source:"La cuenta",target:"Hesap lütfen",romanization:null},
    {source:"Agua",target:"Su lütfen",romanization:null},
    {source:"Sin picante",target:"Acısız lütfen",romanization:null},
    {source:"Está delicioso",target:"Çok lezzetli",romanization:null},
    {source:"Soy vegetariano",target:"Vejetaryenim",romanization:null},
    {source:"Sin cerdo",target:"Domuz eti istemiyorum",romanization:null},
  ])},
  { name:"Direcciones", items: p([
    {source:"¿Dónde está el baño?",target:"Tuvalet nerede?",romanization:null},
    {source:"Gira a la derecha",target:"Sağa dönün",romanization:null},
    {source:"Gira a la izquierda",target:"Sola dönün",romanization:null},
    {source:"Todo recto",target:"Düz gidin",romanization:null},
    {source:"Me he perdido",target:"Kayboldum",romanization:null},
  ])},
  { name:"Transporte", items: p([
    {source:"Al aeropuerto",target:"Havalimanına",romanization:null},
    {source:"Un billete para...",target:"...için bir bilet",romanization:null},
    {source:"¿Dónde está el metro?",target:"Metro nerede?",romanization:null},
    {source:"Un taxi, por favor",target:"Bir taksi lütfen",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"İmdat!",romanization:null},
    {source:"Llama a la policía",target:"Polisi arayın",romanization:null},
    {source:"Necesito un médico",target:"Doktora ihtiyacım var",romanization:null},
    {source:"¿Dónde está el hospital?",target:"Hastane nerede?",romanization:null},
    {source:"Me han robado",target:"Soyuldum",romanization:null},
    {source:"He perdido el pasaporte",target:"Pasaportumu kaybettim",romanization:null},
  ])},
];

// ─── HINDI ────────────────────────────────────────────────────────────────────
const HI = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"नमस्ते",romanization:"Namaste"},
    {source:"Gracias",target:"धन्यवाद",romanization:"Dhanyavaad"},
    {source:"Por favor",target:"कृपया",romanization:"Kripaya"},
    {source:"Perdona",target:"माफ़ करें",romanization:"Maaf karein"},
    {source:"Sí / No",target:"हाँ / नहीं",romanization:"Haan / Nahin"},
    {source:"No entiendo",target:"मुझे समझ नहीं आया",romanization:"Mujhe samajh nahin aaya"},
    {source:"¿Cuánto cuesta?",target:"यह कितने का है?",romanization:"Yah kitne ka hai?"},
    {source:"Adiós",target:"अलविदा",romanization:"Alvida"},
  ])},
  { name:"Restaurante", items: p([
    {source:"La carta",target:"मेनू दिखाइए",romanization:"Menu dikhaaiye"},
    {source:"La cuenta",target:"बिल लाइए",romanization:"Bill laaiye"},
    {source:"Agua",target:"पानी",romanization:"Paani"},
    {source:"Sin picante",target:"मसालेदार नहीं",romanization:"Masaledar nahin"},
    {source:"Está delicioso",target:"बहुत स्वादिष्ट है",romanization:"Bahut swaadisht hai"},
    {source:"Soy vegetariano",target:"मैं शाकाहारी हूँ",romanization:"Main shakahaari hun"},
  ])},
  { name:"Direcciones", items: p([
    {source:"¿Dónde está el baño?",target:"शौचालय कहाँ है?",romanization:"Shauchalaya kahan hai?"},
    {source:"Gira a la derecha",target:"दाईं तरफ मुड़ें",romanization:"Daayin taraf muden"},
    {source:"Gira a la izquierda",target:"बाईं तरफ मुड़ें",romanization:"Baayin taraf muden"},
    {source:"Todo recto",target:"सीधे जाएं",romanization:"Seedhe jaayen"},
    {source:"Me he perdido",target:"मैं खो गया हूँ",romanization:"Main kho gaya hun"},
  ])},
  { name:"Transporte", items: p([
    {source:"Al aeropuerto",target:"हवाई अड्डे पर",romanization:"Havai adde par"},
    {source:"Un taxi, por favor",target:"टैक्सी बुलाइए",romanization:"Taxi bulaiye"},
    {source:"¿Cuánto cuesta?",target:"किराया कितना है?",romanization:"Kiraya kitna hai?"},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"बचाओ!",romanization:"Bachao!"},
    {source:"Llama a la policía",target:"पुलिस को बुलाओ",romanization:"Police ko bulao"},
    {source:"Necesito un médico",target:"मुझे डॉक्टर चाहिए",romanization:"Mujhe doctor chahiye"},
    {source:"¿Dónde está el hospital?",target:"अस्पताल कहाँ है?",romanization:"Aspataal kahan hai?"},
    {source:"Me han robado",target:"मेरी चोरी हो गई",romanization:"Meri chori ho gayi"},
  ])},
];

// ─── RUSO ─────────────────────────────────────────────────────────────────────
const RU = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Привет / Здравствуйте",romanization:"Privet / Zdravstvuyte"},
    {source:"Buenos días",target:"Доброе утро",romanization:"Dobroye utro"},
    {source:"Buenas noches",target:"Добрый вечер",romanization:"Dobryy vecher"},
    {source:"Gracias",target:"Спасибо",romanization:"Spasibo"},
    {source:"De nada",target:"Пожалуйста",romanization:"Pozhaluysta"},
    {source:"Por favor",target:"Пожалуйста",romanization:"Pozhaluysta"},
    {source:"Perdona",target:"Извините",romanization:"Izvinite"},
    {source:"Sí / No",target:"Да / Нет",romanization:"Da / Net"},
    {source:"No entiendo",target:"Я не понимаю",romanization:"Ya ne ponimayu"},
    {source:"¿Cuánto cuesta?",target:"Сколько стоит?",romanization:"Skol'ko stoit?"},
    {source:"Adiós",target:"До свидания",romanization:"Do svidaniya"},
  ])},
  { name:"Restaurante", items: p([
    {source:"La carta",target:"Меню, пожалуйста",romanization:"Menyu, pozhaluysta"},
    {source:"La cuenta",target:"Счёт, пожалуйста",romanization:"Schyot, pozhaluysta"},
    {source:"Agua",target:"Воды, пожалуйста",romanization:"Vody, pozhaluysta"},
    {source:"Está delicioso",target:"Очень вкусно",romanization:"Ochen' vkusno"},
    {source:"Soy vegetariano",target:"Я вегетарианец",romanization:"Ya vegetarianets"},
    {source:"Sin picante",target:"Без острого",romanization:"Bez ostrogo"},
  ])},
  { name:"Direcciones", items: p([
    {source:"¿Dónde está el baño?",target:"Где туалет?",romanization:"Gde tualet?"},
    {source:"Gira a la derecha",target:"Поверните направо",romanization:"Poverníte napravo"},
    {source:"Gira a la izquierda",target:"Поверните налево",romanization:"Poverníte nalevo"},
    {source:"Todo recto",target:"Прямо",romanization:"Pryamo"},
    {source:"Me he perdido",target:"Я заблудился",romanization:"Ya zabludilsya"},
  ])},
  { name:"Transporte", items: p([
    {source:"Al aeropuerto",target:"В аэропорт",romanization:"V aeroport"},
    {source:"Un billete para...",target:"Билет до...",romanization:"Bilet do..."},
    {source:"¿Dónde está el metro?",target:"Где метро?",romanization:"Gde metro?"},
    {source:"Un taxi, por favor",target:"Такси, пожалуйста",romanization:"Taksi, pozhaluysta"},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Помогите!",romanization:"Pomogite!"},
    {source:"Llama a la policía",target:"Вызовите полицию",romanization:"Vyzovite politsiyu"},
    {source:"Necesito un médico",target:"Мне нужен врач",romanization:"Mne nuzhen vrach"},
    {source:"¿Dónde está el hospital?",target:"Где больница?",romanization:"Gde bol'nitsa?"},
    {source:"Me han robado",target:"Меня ограбили",romanization:"Menya ograbili"},
  ])},
];

// ─── NEERLANDÉS ───────────────────────────────────────────────────────────────
const NL = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Hallo",romanization:null},
    {source:"Buenos días",target:"Goedemorgen",romanization:null},
    {source:"Buenas noches",target:"Goedenavond",romanization:null},
    {source:"Gracias",target:"Dank u wel",romanization:null},
    {source:"De nada",target:"Graag gedaan",romanization:null},
    {source:"Por favor",target:"Alstublieft",romanization:null},
    {source:"Perdona",target:"Excuseer me",romanization:null},
    {source:"Sí / No",target:"Ja / Nee",romanization:null},
    {source:"No entiendo",target:"Ik begrijp het niet",romanization:null},
    {source:"¿Cuánto cuesta?",target:"Hoeveel kost het?",romanization:null},
    {source:"Adiós",target:"Tot ziens",romanization:null},
  ])},
  { name:"Restaurante", items: p([
    {source:"La carta",target:"De menukaart, alstublieft",romanization:null},
    {source:"La cuenta",target:"De rekening, alstublieft",romanization:null},
    {source:"Agua",target:"Water, alstublieft",romanization:null},
    {source:"Soy vegetariano",target:"Ik ben vegetariër",romanization:null},
    {source:"Está delicioso",target:"Het is heerlijk",romanization:null},
  ])},
  { name:"Direcciones", items: p([
    {source:"¿Dónde está el baño?",target:"Waar is het toilet?",romanization:null},
    {source:"Gira a la derecha",target:"Ga rechtsaf",romanization:null},
    {source:"Gira a la izquierda",target:"Ga linksaf",romanization:null},
    {source:"Todo recto",target:"Rechtdoor",romanization:null},
    {source:"Me he perdido",target:"Ik ben verdwaald",romanization:null},
  ])},
  { name:"Transporte", items: p([
    {source:"Al aeropuerto",target:"Naar het vliegveld",romanization:null},
    {source:"Un billete para...",target:"Een kaartje naar...",romanization:null},
    {source:"Un taxi, por favor",target:"Een taxi, alstublieft",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Help!",romanization:null},
    {source:"Llama a la policía",target:"Bel de politie",romanization:null},
    {source:"Necesito un médico",target:"Ik heb een dokter nodig",romanization:null},
    {source:"¿Dónde está el hospital?",target:"Waar is het ziekenhuis?",romanization:null},
  ])},
];

// ─── POLACO ───────────────────────────────────────────────────────────────────
const PL = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Cześć / Dzień dobry",romanization:null},
    {source:"Buenos días",target:"Dzień dobry",romanization:null},
    {source:"Gracias",target:"Dziękuję",romanization:null},
    {source:"De nada",target:"Proszę",romanization:null},
    {source:"Por favor",target:"Proszę",romanization:null},
    {source:"Perdona",target:"Przepraszam",romanization:null},
    {source:"Sí / No",target:"Tak / Nie",romanization:null},
    {source:"No entiendo",target:"Nie rozumiem",romanization:null},
    {source:"¿Cuánto cuesta?",target:"Ile to kosztuje?",romanization:null},
    {source:"Adiós",target:"Do widzenia",romanization:null},
  ])},
  { name:"Restaurante", items: p([
    {source:"La carta",target:"Menu, proszę",romanization:null},
    {source:"La cuenta",target:"Rachunek, proszę",romanization:null},
    {source:"Agua",target:"Woda, proszę",romanization:null},
    {source:"Soy vegetariano",target:"Jestem wegetarianinem",romanization:null},
    {source:"Está delicioso",target:"To jest pyszne",romanization:null},
  ])},
  { name:"Direcciones", items: p([
    {source:"¿Dónde está el baño?",target:"Gdzie jest toaleta?",romanization:null},
    {source:"Gira a la derecha",target:"Skręć w prawo",romanization:null},
    {source:"Gira a la izquierda",target:"Skręć w lewo",romanization:null},
    {source:"Todo recto",target:"Prosto",romanization:null},
    {source:"Me he perdido",target:"Zgubiłem się",romanization:null},
  ])},
  { name:"Transporte", items: p([
    {source:"Al aeropuerto",target:"Na lotnisko",romanization:null},
    {source:"Un billete para...",target:"Bilet do...",romanization:null},
    {source:"Un taxi, por favor",target:"Taksówkę, proszę",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Pomocy!",romanization:null},
    {source:"Llama a la policía",target:"Zadzwoń na policję",romanization:null},
    {source:"Necesito un médico",target:"Potrzebuję lekarza",romanization:null},
    {source:"¿Dónde está el hospital?",target:"Gdzie jest szpital?",romanization:null},
  ])},
];

// ─── CHECO ────────────────────────────────────────────────────────────────────
const CS = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Ahoj / Dobrý den",romanization:null},
    {source:"Gracias",target:"Děkuji",romanization:null},
    {source:"Por favor",target:"Prosím",romanization:null},
    {source:"Perdona",target:"Promiňte",romanization:null},
    {source:"Sí / No",target:"Ano / Ne",romanization:null},
    {source:"No entiendo",target:"Nerozumím",romanization:null},
    {source:"¿Cuánto cuesta?",target:"Kolik to stojí?",romanization:null},
    {source:"Adiós",target:"Na shledanou",romanization:null},
  ])},
  { name:"Restaurante", items: p([
    {source:"La carta",target:"Jídelní lístek, prosím",romanization:null},
    {source:"La cuenta",target:"Účet, prosím",romanization:null},
    {source:"Agua",target:"Vodu, prosím",romanization:null},
    {source:"Está delicioso",target:"Je to výborné",romanization:null},
  ])},
  { name:"Direcciones", items: p([
    {source:"¿Dónde está el baño?",target:"Kde je toaleta?",romanization:null},
    {source:"Gira a la derecha",target:"Odbočte doprava",romanization:null},
    {source:"Gira a la izquierda",target:"Odbočte doleva",romanization:null},
    {source:"Todo recto",target:"Rovně",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Pomoc!",romanization:null},
    {source:"Llama a la policía",target:"Zavolejte policii",romanization:null},
    {source:"Necesito un médico",target:"Potřebuji lékaře",romanization:null},
  ])},
];

// ─── HÚNGARO ──────────────────────────────────────────────────────────────────
const HU = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Szia / Jó napot",romanization:null},
    {source:"Gracias",target:"Köszönöm",romanization:null},
    {source:"Por favor",target:"Kérem",romanization:null},
    {source:"Perdona",target:"Elnézést",romanization:null},
    {source:"Sí / No",target:"Igen / Nem",romanization:null},
    {source:"No entiendo",target:"Nem értem",romanization:null},
    {source:"¿Cuánto cuesta?",target:"Mennyibe kerül?",romanization:null},
    {source:"Adiós",target:"Viszontlátásra",romanization:null},
  ])},
  { name:"Restaurante", items: p([
    {source:"La carta",target:"Az étlapot kérem",romanization:null},
    {source:"La cuenta",target:"A számlát kérem",romanization:null},
    {source:"Agua",target:"Vizet kérek",romanization:null},
    {source:"Está delicioso",target:"Nagyon finom",romanization:null},
  ])},
  { name:"Direcciones", items: p([
    {source:"¿Dónde está el baño?",target:"Hol van a mosdó?",romanization:null},
    {source:"Gira a la derecha",target:"Forduljon jobbra",romanization:null},
    {source:"Gira a la izquierda",target:"Forduljon balra",romanization:null},
    {source:"Todo recto",target:"Egyenesen",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Segítség!",romanization:null},
    {source:"Llama a la policía",target:"Hívja a rendőrséget",romanization:null},
    {source:"Necesito un médico",target:"Orvosra van szükségem",romanization:null},
  ])},
];

// ─── CROATA / SERBIO / BOSNIO ─────────────────────────────────────────────────
const HR = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Bok / Dobar dan",romanization:null},
    {source:"Gracias",target:"Hvala",romanization:null},
    {source:"Por favor",target:"Molim",romanization:null},
    {source:"Perdona",target:"Oprostite",romanization:null},
    {source:"Sí / No",target:"Da / Ne",romanization:null},
    {source:"No entiendo",target:"Ne razumijem",romanization:null},
    {source:"¿Cuánto cuesta?",target:"Koliko košta?",romanization:null},
    {source:"Adiós",target:"Doviđenja",romanization:null},
  ])},
  { name:"Restaurante", items: p([
    {source:"La carta",target:"Jelovnik, molim",romanization:null},
    {source:"La cuenta",target:"Račun, molim",romanization:null},
    {source:"Agua",target:"Vodu, molim",romanization:null},
    {source:"Está delicioso",target:"Izvrsno je",romanization:null},
  ])},
  { name:"Direcciones", items: p([
    {source:"¿Dónde está el baño?",target:"Gdje je zahod?",romanization:null},
    {source:"Gira a la derecha",target:"Skrenite desno",romanization:null},
    {source:"Gira a la izquierda",target:"Skrenite lijevo",romanization:null},
    {source:"Todo recto",target:"Ravno",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Upomoć!",romanization:null},
    {source:"Llama a la policía",target:"Pozovite policiju",romanization:null},
    {source:"Necesito un médico",target:"Treba mi liječnik",romanization:null},
  ])},
];

// ─── RUMANO ───────────────────────────────────────────────────────────────────
const RO = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Bună / Bună ziua",romanization:null},
    {source:"Gracias",target:"Mulțumesc",romanization:null},
    {source:"Por favor",target:"Vă rog",romanization:null},
    {source:"Perdona",target:"Scuzați-mă",romanization:null},
    {source:"Sí / No",target:"Da / Nu",romanization:null},
    {source:"No entiendo",target:"Nu înțeleg",romanization:null},
    {source:"¿Cuánto cuesta?",target:"Cât costă?",romanization:null},
    {source:"Adiós",target:"La revedere",romanization:null},
  ])},
  { name:"Restaurante", items: p([
    {source:"La carta",target:"Meniul, vă rog",romanization:null},
    {source:"La cuenta",target:"Nota de plată, vă rog",romanization:null},
    {source:"Agua",target:"Apă, vă rog",romanization:null},
    {source:"Está delicioso",target:"Este delicios",romanization:null},
  ])},
  { name:"Direcciones", items: p([
    {source:"¿Dónde está el baño?",target:"Unde este toaleta?",romanization:null},
    {source:"Gira a la derecha",target:"Întoarceți la dreapta",romanization:null},
    {source:"Gira a la izquierda",target:"Întoarceți la stânga",romanization:null},
    {source:"Todo recto",target:"Înainte",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Ajutor!",romanization:null},
    {source:"Llama a la policía",target:"Sunați la poliție",romanization:null},
    {source:"Necesito un médico",target:"Am nevoie de un medic",romanization:null},
  ])},
];

// ─── SUECO / NORUEGO / DANÉS / FINLANDÉS / ISLANDÉS ──────────────────────────
const SV = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Hej",romanization:null},
    {source:"Buenos días",target:"God morgon",romanization:null},
    {source:"Gracias",target:"Tack",romanization:null},
    {source:"Por favor",target:"Snälla / Varsågod",romanization:null},
    {source:"Perdona",target:"Ursäkta",romanization:null},
    {source:"Sí / No",target:"Ja / Nej",romanization:null},
    {source:"No entiendo",target:"Jag förstår inte",romanization:null},
    {source:"¿Cuánto cuesta?",target:"Hur mycket kostar det?",romanization:null},
    {source:"Adiós",target:"Hej då",romanization:null},
  ])},
  { name:"Restaurante", items: p([
    {source:"La carta",target:"Menyn, tack",romanization:null},
    {source:"La cuenta",target:"Notan, tack",romanization:null},
    {source:"Agua",target:"Vatten, tack",romanization:null},
    {source:"Está delicioso",target:"Det är jättegott",romanization:null},
  ])},
  { name:"Direcciones", items: p([
    {source:"¿Dónde está el baño?",target:"Var är toaletten?",romanization:null},
    {source:"Gira a la derecha",target:"Sväng till höger",romanization:null},
    {source:"Gira a la izquierda",target:"Sväng till vänster",romanization:null},
    {source:"Todo recto",target:"Rakt fram",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Hjälp!",romanization:null},
    {source:"Llama a la policía",target:"Ring polisen",romanization:null},
    {source:"Necesito un médico",target:"Jag behöver en läkare",romanization:null},
  ])},
];

const NO = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Hei",romanization:null},
    {source:"Gracias",target:"Takk",romanization:null},
    {source:"Por favor",target:"Vær så snill",romanization:null},
    {source:"Sí / No",target:"Ja / Nei",romanization:null},
    {source:"No entiendo",target:"Jeg forstår ikke",romanization:null},
    {source:"¿Cuánto cuesta?",target:"Hva koster det?",romanization:null},
    {source:"Adiós",target:"Ha det bra",romanization:null},
  ])},
  { name:"Restaurante", items: p([
    {source:"La carta",target:"Menyen, takk",romanization:null},
    {source:"La cuenta",target:"Regningen, takk",romanization:null},
    {source:"Agua",target:"Vann, takk",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Hjelp!",romanization:null},
    {source:"Llama a la policía",target:"Ring politiet",romanization:null},
    {source:"Necesito un médico",target:"Jeg trenger lege",romanization:null},
  ])},
];

const DA = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Hej",romanization:null},
    {source:"Gracias",target:"Tak",romanization:null},
    {source:"Por favor",target:"Vær så venlig",romanization:null},
    {source:"Sí / No",target:"Ja / Nej",romanization:null},
    {source:"No entiendo",target:"Jeg forstår ikke",romanization:null},
    {source:"¿Cuánto cuesta?",target:"Hvad koster det?",romanization:null},
    {source:"Adiós",target:"Farvel",romanization:null},
  ])},
  { name:"Restaurante", items: p([
    {source:"La carta",target:"Menuen, tak",romanization:null},
    {source:"La cuenta",target:"Regningen, tak",romanization:null},
    {source:"Agua",target:"Vand, tak",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Hjælp!",romanization:null},
    {source:"Llama a la policía",target:"Ring til politiet",romanization:null},
    {source:"Necesito un médico",target:"Jeg har brug for en læge",romanization:null},
  ])},
];

const FI = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Hei / Moi",romanization:null},
    {source:"Gracias",target:"Kiitos",romanization:null},
    {source:"Por favor",target:"Ole hyvä",romanization:null},
    {source:"Sí / No",target:"Kyllä / Ei",romanization:null},
    {source:"No entiendo",target:"En ymmärrä",romanization:null},
    {source:"¿Cuánto cuesta?",target:"Paljonko maksaa?",romanization:null},
    {source:"Adiós",target:"Näkemiin",romanization:null},
  ])},
  { name:"Restaurante", items: p([
    {source:"La carta",target:"Ruokalista, kiitos",romanization:null},
    {source:"La cuenta",target:"Lasku, kiitos",romanization:null},
    {source:"Agua",target:"Vettä, kiitos",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Apua!",romanization:null},
    {source:"Llama a la policía",target:"Soita poliisille",romanization:null},
    {source:"Necesito un médico",target:"Tarvitsen lääkärin",romanization:null},
  ])},
];

const IS = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Halló / Góðan dag",romanization:null},
    {source:"Gracias",target:"Takk",romanization:null},
    {source:"Por favor",target:"Gjörðu svo vel",romanization:null},
    {source:"Sí / No",target:"Já / Nei",romanization:null},
    {source:"No entiendo",target:"Ég skil ekki",romanization:null},
    {source:"¿Cuánto cuesta?",target:"Hvað kostar þetta?",romanization:null},
    {source:"Adiós",target:"Bless",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Hjálp!",romanization:null},
    {source:"Llama a la policía",target:"Hringdu í lögreglu",romanization:null},
    {source:"Necesito un médico",target:"Mér þarf lækni",romanization:null},
  ])},
];

// ─── HEBREO ───────────────────────────────────────────────────────────────────
const HE = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"שלום",romanization:"Shalom"},
    {source:"Buenos días",target:"בוקר טוב",romanization:"Boker tov"},
    {source:"Buenas noches",target:"ערב טוב",romanization:"Erev tov"},
    {source:"Gracias",target:"תודה",romanization:"Toda"},
    {source:"De nada",target:"בבקשה",romanization:"Bevakasha"},
    {source:"Por favor",target:"בבקשה",romanization:"Bevakasha"},
    {source:"Perdona",target:"סליחה",romanization:"Slicha"},
    {source:"Sí / No",target:"כן / לא",romanization:"Ken / Lo"},
    {source:"No entiendo",target:"אני לא מבין",romanization:"Ani lo mevin"},
    {source:"¿Cuánto cuesta?",target:"כמה זה עולה?",romanization:"Kama ze ole?"},
    {source:"Adiós",target:"להתראות",romanization:"Lehitraot"},
  ])},
  { name:"Restaurante", items: p([
    {source:"La carta",target:"את התפריט, בבקשה",romanization:"Et hatafrit, bevakasha"},
    {source:"La cuenta",target:"את החשבון, בבקשה",romanization:"Et hacheshbon, bevakasha"},
    {source:"Agua",target:"מים, בבקשה",romanization:"Mayim, bevakasha"},
    {source:"Soy vegetariano",target:"אני צמחוני",romanization:"Ani tsimkhoni"},
    {source:"Sin cerdo",target:"בלי חזיר",romanization:"Bli hazir"},
    {source:"Está delicioso",target:"זה מאוד טעים",romanization:"Ze meod taim"},
  ])},
  { name:"Direcciones", items: p([
    {source:"¿Dónde está el baño?",target:"איפה השירותים?",romanization:"Eifo hashirutim?"},
    {source:"Gira a la derecha",target:"פנה ימינה",romanization:"Pne yamina"},
    {source:"Gira a la izquierda",target:"פנה שמאלה",romanization:"Pne smola"},
    {source:"Todo recto",target:"ישר",romanization:"Yashar"},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"עזרה!",romanization:"Ezra!"},
    {source:"Llama a la policía",target:"תתקשר למשטרה",romanization:"Titkasher lemishtara"},
    {source:"Necesito un médico",target:"אני צריך רופא",romanization:"Ani tsarikh rofe"},
    {source:"¿Dónde está el hospital?",target:"איפה בית החולים?",romanization:"Eifo beit hacholim?"},
  ])},
];

// ─── GEORGIANO ────────────────────────────────────────────────────────────────
const KA = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"გამარჯობა",romanization:"Gamarjoba"},
    {source:"Gracias",target:"მადლობა",romanization:"Madloba"},
    {source:"Por favor",target:"გთხოვთ",romanization:"Gtkhovt"},
    {source:"Perdona",target:"ბოდიში",romanization:"Bodishi"},
    {source:"Sí / No",target:"კი / არა",romanization:"Ki / Ara"},
    {source:"No entiendo",target:"არ მესმის",romanization:"Ar mesmis"},
    {source:"¿Cuánto cuesta?",target:"რა ღირს?",romanization:"Ra ghirs?"},
    {source:"Adiós",target:"ნახვამდის",romanization:"Nakhvamdis"},
  ])},
  { name:"Restaurante", items: p([
    {source:"La carta",target:"მენიუ, გთხოვთ",romanization:"Meniu, gtkhovt"},
    {source:"La cuenta",target:"ანგარიში, გთხოვთ",romanization:"Angarishi, gtkhovt"},
    {source:"Agua",target:"წყალი",romanization:"Tskhali"},
    {source:"Está delicioso",target:"ძალიან გემრიელია",romanization:"Dzalian gemrieli"},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"მიშველეთ!",romanization:"Mishvelet!"},
    {source:"Llama a la policía",target:"დაუძახეთ პოლიციას",romanization:"Daudzakhet politsias"},
    {source:"Necesito un médico",target:"მჭირდება ექიმი",romanization:"Mchirdeba ekimi"},
  ])},
];

// ─── ARMENIO ──────────────────────────────────────────────────────────────────
const HY = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Բարև",romanization:"Barev"},
    {source:"Gracias",target:"Շնորհակալություն",romanization:"Shnorhakalutyun"},
    {source:"Por favor",target:"Խնդրեմ",romanization:"Khndrem"},
    {source:"Sí / No",target:"Այո / Ոչ",romanization:"Ayo / Voch"},
    {source:"No entiendo",target:"Չեմ հասկանում",romanization:"Chem haskanum"},
    {source:"¿Cuánto cuesta?",target:"Որքա՞ն արժե",romanization:"Vorkan arje?"},
    {source:"Adiós",target:"Ցտեսություն",romanization:"Tstesutyun"},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Օգնություն!",romanization:"Ognutyun!"},
    {source:"Llama a la policía",target:"Կանչեք ոստիկանությանը",romanization:"Kanchek vostikanutyan"},
    {source:"Necesito un médico",target:"Ինձ պետք է բժիշկ",romanization:"Indz petk e bzhishk"},
  ])},
];

// ─── AZERBAIYANO ──────────────────────────────────────────────────────────────
const AZ = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Salam",romanization:null},
    {source:"Gracias",target:"Təşəkkür edirəm",romanization:null},
    {source:"Por favor",target:"Zəhmət olmasa",romanization:null},
    {source:"Sí / No",target:"Bəli / Xeyr",romanization:null},
    {source:"No entiendo",target:"Başa düşmürəm",romanization:null},
    {source:"¿Cuánto cuesta?",target:"Bu nə qədərdir?",romanization:null},
    {source:"Adiós",target:"Sağ olun",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Kömək edin!",romanization:null},
    {source:"Llama a la policía",target:"Polisi çağırın",romanization:null},
    {source:"Necesito un médico",target:"Mənə həkim lazımdır",romanization:null},
  ])},
];

// ─── UCRANIANO ────────────────────────────────────────────────────────────────
const UK = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Привіт / Добрий день",romanization:"Pryvit / Dobryy den"},
    {source:"Gracias",target:"Дякую",romanization:"Dyakuyu"},
    {source:"Por favor",target:"Будь ласка",romanization:"Bud laska"},
    {source:"Sí / No",target:"Так / Ні",romanization:"Tak / Ni"},
    {source:"No entiendo",target:"Я не розумію",romanization:"Ya ne rozumiyu"},
    {source:"¿Cuánto cuesta?",target:"Скільки коштує?",romanization:"Skilky koshtuye?"},
    {source:"Adiós",target:"До побачення",romanization:"Do pobachennya"},
  ])},
  { name:"Restaurante", items: p([
    {source:"La carta",target:"Меню, будь ласка",romanization:"Menyu, bud laska"},
    {source:"La cuenta",target:"Рахунок, будь ласка",romanization:"Rakhunok, bud laska"},
    {source:"Agua",target:"Воду, будь ласка",romanization:"Vodu, bud laska"},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Допоможіть!",romanization:"Dopomozhit!"},
    {source:"Llama a la policía",target:"Викличте поліцію",romanization:"Vyklychte politsiyu"},
    {source:"Necesito un médico",target:"Мені потрібен лікар",romanization:"Meni potriben likar"},
  ])},
];

// ─── BÚLGARO ──────────────────────────────────────────────────────────────────
const BG = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Здравейте",romanization:"Zdraveyte"},
    {source:"Gracias",target:"Благодаря",romanization:"Blagodarya"},
    {source:"Por favor",target:"Моля",romanization:"Molya"},
    {source:"Sí / No",target:"Да / Не",romanization:"Da / Ne"},
    {source:"No entiendo",target:"Не разбирам",romanization:"Ne razbiram"},
    {source:"¿Cuánto cuesta?",target:"Колко струва?",romanization:"Kolko struva?"},
    {source:"Adiós",target:"Довиждане",romanization:"Dovizhdane"},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Помощ!",romanization:"Pomosht!"},
    {source:"Llama a la policía",target:"Повикайте полицията",romanization:"Povikayte politsiyata"},
    {source:"Necesito un médico",target:"Имам нужда от лекар",romanization:"Imam nuzhda ot lekar"},
  ])},
];

// ─── ALBANÉS ──────────────────────────────────────────────────────────────────
const SQ = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Përshëndetje",romanization:null},
    {source:"Gracias",target:"Faleminderit",romanization:null},
    {source:"Por favor",target:"Ju lutem",romanization:null},
    {source:"Sí / No",target:"Po / Jo",romanization:null},
    {source:"No entiendo",target:"Nuk kuptoj",romanization:null},
    {source:"¿Cuánto cuesta?",target:"Sa kushton?",romanization:null},
    {source:"Adiós",target:"Mirupafshim",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Ndihmë!",romanization:null},
    {source:"Llama a la policía",target:"Thirr policinë",romanization:null},
    {source:"Necesito un médico",target:"Kam nevojë për mjek",romanization:null},
  ])},
];

// ─── SWAHILI ──────────────────────────────────────────────────────────────────
const SW = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Habari / Jambo",romanization:null},
    {source:"Buenos días",target:"Habari ya asubuhi",romanization:null},
    {source:"Gracias",target:"Asante",romanization:null},
    {source:"De nada",target:"Karibu",romanization:null},
    {source:"Por favor",target:"Tafadhali",romanization:null},
    {source:"Perdona",target:"Samahani",romanization:null},
    {source:"Sí / No",target:"Ndiyo / Hapana",romanization:null},
    {source:"No entiendo",target:"Sielewi",romanization:null},
    {source:"¿Cuánto cuesta?",target:"Bei gani?",romanization:null},
    {source:"Adiós",target:"Kwaheri",romanization:null},
  ])},
  { name:"Restaurante", items: p([
    {source:"La carta",target:"Menyu, tafadhali",romanization:null},
    {source:"La cuenta",target:"Bili, tafadhali",romanization:null},
    {source:"Agua",target:"Maji",romanization:null},
    {source:"Está delicioso",target:"Ni kitamu sana",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Msaada!",romanization:null},
    {source:"Llama a la policía",target:"Piga simu polisi",romanization:null},
    {source:"Necesito un médico",target:"Nahitaji daktari",romanization:null},
  ])},
];

// ─── FILIPINO / TAGALO ────────────────────────────────────────────────────────
const FIL = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Kamusta",romanization:null},
    {source:"Gracias",target:"Salamat",romanization:null},
    {source:"Por favor",target:"Pakiusap",romanization:null},
    {source:"Perdona",target:"Paumanhin",romanization:null},
    {source:"Sí / No",target:"Oo / Hindi",romanization:null},
    {source:"No entiendo",target:"Hindi ko naiintindihan",romanization:null},
    {source:"¿Cuánto cuesta?",target:"Magkano ito?",romanization:null},
    {source:"Adiós",target:"Paalam",romanization:null},
  ])},
  { name:"Restaurante", items: p([
    {source:"La carta",target:"Menu, pakiusap",romanization:null},
    {source:"La cuenta",target:"Ang bill, pakiusap",romanization:null},
    {source:"Agua",target:"Tubig",romanization:null},
    {source:"Está delicioso",target:"Masarap",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Saklolo!",romanization:null},
    {source:"Llama a la policía",target:"Tumawag ng pulis",romanization:null},
    {source:"Necesito un médico",target:"Kailangan ko ng doktor",romanization:null},
  ])},
];

// ─── JEMER (CAMBOYA) ──────────────────────────────────────────────────────────
const KM = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"សួស្តី",romanization:"Suasdei"},
    {source:"Gracias",target:"អរគុណ",romanization:"Arkun"},
    {source:"Por favor",target:"សូម",romanization:"Som"},
    {source:"Sí / No",target:"បាទ / ទេ",romanization:"Bat / Te"},
    {source:"No entiendo",target:"ខ្ញុំមិនយល់",romanization:"Khnhom min yol"},
    {source:"¿Cuánto cuesta?",target:"តម្លៃប៉ុន្មាន?",romanization:"Tamlai ponman?"},
    {source:"Adiós",target:"លា​សិន​ហើយ",romanization:"Lea sen haoy"},
  ])},
  { name:"Restaurante", items: p([
    {source:"La carta",target:"ម៉ឺនុយ សូម",romanization:"Menu, som"},
    {source:"La cuenta",target:"គិតប្រាក់ សូម",romanization:"Kit prak, som"},
    {source:"Agua",target:"ទឹក",romanization:"Tuk"},
    {source:"Sin picante",target:"មិនហឹរ",romanization:"Min heur"},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"ជួយផង!",romanization:"Juoy phong!"},
    {source:"Llama a la policía",target:"ហៅប៉ូលិស",romanization:"Hav polis"},
    {source:"Necesito un médico",target:"ខ្ញុំត្រូវការវេជ្ជបណ្ឌិត",romanization:"Khnhom trov kar vejjabandit"},
  ])},
];

// ─── NEPALÉS ──────────────────────────────────────────────────────────────────
const NE = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"नमस्ते",romanization:"Namaste"},
    {source:"Gracias",target:"धन्यवाद",romanization:"Dhanyabad"},
    {source:"Por favor",target:"कृपया",romanization:"Kripaya"},
    {source:"Sí / No",target:"हो / होइन",romanization:"Ho / Hoina"},
    {source:"No entiendo",target:"मलाई बुझेन",romanization:"Malai bujhena"},
    {source:"¿Cuánto cuesta?",target:"कति पर्छ?",romanization:"Kati parchha?"},
    {source:"Adiós",target:"नमस्ते / बिदाई",romanization:"Namaste / Bidai"},
  ])},
  { name:"Restaurante", items: p([
    {source:"La carta",target:"मेनु दिनुस्",romanization:"Menu dinus"},
    {source:"La cuenta",target:"बिल दिनुस्",romanization:"Bill dinus"},
    {source:"Agua",target:"पानी",romanization:"Pani"},
    {source:"Sin picante",target:"पिरो नगरि",romanization:"Piro nagari"},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"गुहार!",romanization:"Guhar!"},
    {source:"Llama a la policía",target:"प्रहरी बोलाउनुस्",romanization:"Prahari bolaunus"},
    {source:"Necesito un médico",target:"मलाई डाक्टर चाहिन्छ",romanization:"Malai doctor chahincha"},
  ])},
];

// ─── AMHÁRICO (ETIOPÍA) ───────────────────────────────────────────────────────
const AM = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"ሰላም",romanization:"Selam"},
    {source:"Gracias",target:"አመሰግናለሁ",romanization:"Ameseginalehu"},
    {source:"Por favor",target:"እባክህ",romanization:"Ibakih"},
    {source:"Sí / No",target:"አዎ / አይ",romanization:"Awo / Ay"},
    {source:"No entiendo",target:"አልገባኝም",romanization:"Algebanym"},
    {source:"¿Cuánto cuesta?",target:"ስንት ነው?",romanization:"Sint new?"},
    {source:"Adiós",target:"ደህና ሁን",romanization:"Dehna hun"},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"እርዳታ!",romanization:"Irdata!"},
    {source:"Llama a la policía",target:"ፖሊስ ጥራ",romanization:"Polis tira"},
    {source:"Necesito un médico",target:"ሐኪም ያስፈልገኛል",romanization:"Hakim yasfelegnal"},
  ])},
];

// ─── MONGOL ───────────────────────────────────────────────────────────────────
const MN = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Сайн байна уу",romanization:"Sain baina uu"},
    {source:"Gracias",target:"Баярлалаа",romanization:"Bayarlalaa"},
    {source:"Por favor",target:"Гуйя",romanization:"Guiya"},
    {source:"Sí / No",target:"Тийм / Үгүй",romanization:"Tiim / Ugui"},
    {source:"No entiendo",target:"Би ойлгохгүй байна",romanization:"Bi oilgohgui baina"},
    {source:"¿Cuánto cuesta?",target:"Хэд вэ?",romanization:"Hed ve?"},
    {source:"Adiós",target:"Баяртай",romanization:"Bayartai"},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Тусал!",romanization:"Tusal!"},
    {source:"Llama a la policía",target:"Цагдаа дуудаарай",romanization:"Tsagdaa duudarai"},
    {source:"Necesito un médico",target:"Надад эмч хэрэгтэй",romanization:"Nadad emch heregtei"},
  ])},
];

// ─── KAZAJO ───────────────────────────────────────────────────────────────────
const KK = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Сәлем / Сәлеметсіз бе",romanization:"Salem / Salemetsis be"},
    {source:"Gracias",target:"Рахмет",romanization:"Rakhmet"},
    {source:"Por favor",target:"Өтінемін",romanization:"Otinemin"},
    {source:"Sí / No",target:"Иә / Жоқ",romanization:"Ia / Zhok"},
    {source:"No entiendo",target:"Мен түсінбеймін",romanization:"Men tusinbeymin"},
    {source:"¿Cuánto cuesta?",target:"Бұл қанша?",romanization:"Bul kansha?"},
    {source:"Adiós",target:"Сау болыңыз",romanization:"Sau bolynyz"},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Көмек!",romanization:"Komek!"},
    {source:"Llama a la policía",target:"Полицияны шақырыңыз",romanization:"Politsiyanı shakyryŋyz"},
    {source:"Necesito un médico",target:"Маған дәрігер керек",romanization:"Magan dariger kerek"},
  ])},
];

const UZ = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Salom",romanization:null},
    {source:"Gracias",target:"Rahmat",romanization:null},
    {source:"Por favor",target:"Iltimos",romanization:null},
    {source:"Sí / No",target:"Ha / Yo'q",romanization:null},
    {source:"No entiendo",target:"Tushunmayapman",romanization:null},
    {source:"¿Cuánto cuesta?",target:"Bu qancha?",romanization:null},
    {source:"Adiós",target:"Xayr",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Yordam!",romanization:null},
    {source:"Llama a la policía",target:"Politsiyani chaqiring",romanization:null},
    {source:"Necesito un médico",target:"Menga shifokor kerak",romanization:null},
  ])},
];

// ─── BIRMANO (MYANMAR) ────────────────────────────────────────────────────────
const MY = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"မင်္ဂလာပါ",romanization:"Mingalaba"},
    {source:"Gracias",target:"ကျေးဇူးတင်ပါတယ်",romanization:"Kyezutinbade"},
    {source:"Por favor",target:"ကျေးဇူးပြု၍",romanization:"Kyezu pyu i"},
    {source:"Sí / No",target:"ဟုတ်ကဲ့ / မဟုတ်ဘူး",romanization:"Hout ke / Ma hout bu"},
    {source:"¿Cuánto cuesta?",target:"ဘယ်လောက်လဲ",romanization:"Be lout le?"},
    {source:"Adiós",target:"သွားတော့မယ်",romanization:"Thwa taw me"},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"ကူညီပါ!",romanization:"Ku nyi ba!"},
    {source:"Llama a la policía",target:"ရဲကိုဖုန်းဆက်ပါ",romanization:"Ye ko phone set pa"},
    {source:"Necesito un médico",target:"ဆရာဝန်လိုအပ်သည်",romanization:"Sayawun lo at the"},
  ])},
];

// ─── LAO ──────────────────────────────────────────────────────────────────────
const LO = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"ສະບາຍດີ",romanization:"Sabaidee"},
    {source:"Gracias",target:"ຂອບໃຈ",romanization:"Khob chai"},
    {source:"Por favor",target:"ກະລຸນາ",romanization:"Kaluna"},
    {source:"Sí / No",target:"ແມ່ນ / ບໍ່",romanization:"Men / Bo"},
    {source:"¿Cuánto cuesta?",target:"ລາຄາເທົ່າໃດ?",romanization:"Laka thao dai?"},
    {source:"Adiós",target:"ລາກ່ອນ",romanization:"La kon"},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"ຊ່ວຍດ້ວຍ!",romanization:"Souay duay!"},
    {source:"Llama a la policía",target:"ໂທຫາຕຳຫຼວດ",romanization:"Tho ha tamluad"},
    {source:"Necesito un médico",target:"ຕ້ອງການໝໍ",romanization:"Tong kan mo"},
  ])},
];

// ─── CINGALÉS (SRI LANKA) ─────────────────────────────────────────────────────
const SI = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"ආයුබෝවන්",romanization:"Ayubowan"},
    {source:"Gracias",target:"ස්තූතියි",romanization:"Sthuthi"},
    {source:"Por favor",target:"කරුණාකර",romanization:"Karunakara"},
    {source:"Sí / No",target:"ඔව් / නැහැ",romanization:"Ow / Nahe"},
    {source:"¿Cuánto cuesta?",target:"මිල කීයද?",romanization:"Mila keeya da?"},
    {source:"Adiós",target:"ගිහින් එන්නම්",romanization:"Gihin ennam"},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"උදව් කරන්න!",romanization:"Udav karanna!"},
    {source:"Llama a la policía",target:"පොලිසියට කතා කරන්න",romanization:"Polisiyata kata karanna"},
    {source:"Necesito un médico",target:"මට වෛද්‍යවරයෙකු අවශ්‍යයි",romanization:"Mata vaidyawarayeku awashyayi"},
  ])},
];

// ─── BIELORRUSO ───────────────────────────────────────────────────────────────
const BE = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Прывітанне",romanization:"Pryvitanne"},
    {source:"Gracias",target:"Дзякуй",romanization:"Dzyakuy"},
    {source:"Por favor",target:"Калі ласка",romanization:"Kali laska"},
    {source:"Sí / No",target:"Так / Не",romanization:"Tak / Ne"},
    {source:"No entiendo",target:"Я не разумею",romanization:"Ya ne razumeyu"},
    {source:"¿Cuánto cuesta?",target:"Колькі каштуе?",romanization:"Kolki kashtuye?"},
    {source:"Adiós",target:"Да пабачэння",romanization:"Da pabachennya"},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Дапамажыце!",romanization:"Dapamazhytse!"},
    {source:"Llama a la policía",target:"Выклічце міліцыю",romanization:"Vyklichtse militsyyu"},
    {source:"Necesito un médico",target:"Мне патрэбен лекар",romanization:"Mne patreben lekar"},
  ])},
];

// ─── MACEDONIO ────────────────────────────────────────────────────────────────
const MK = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Здраво",romanization:"Zdravo"},
    {source:"Gracias",target:"Благодарам",romanization:"Blagodaram"},
    {source:"Por favor",target:"Ве молам",romanization:"Ve molam"},
    {source:"Sí / No",target:"Да / Не",romanization:"Da / Ne"},
    {source:"No entiendo",target:"Не разбирам",romanization:"Ne razbiram"},
    {source:"Adiós",target:"Довидување",romanization:"Doviduvanje"},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Помош!",romanization:"Pomosh!"},
    {source:"Llama a la policía",target:"Повикајте полиција",romanization:"Povikajte politsija"},
    {source:"Necesito un médico",target:"Ми треба лекар",romanization:"Mi treba lekar"},
  ])},
];

// ─── BENGALÍ ──────────────────────────────────────────────────────────────────
const BN = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"হ্যালো / নমস্কার",romanization:"Hello / Nomoskar"},
    {source:"Gracias",target:"ধন্যবাদ",romanization:"Dhonnyobad"},
    {source:"Por favor",target:"অনুগ্রহ করে",romanization:"Anugraha kore"},
    {source:"Sí / No",target:"হ্যাঁ / না",romanization:"Hyan / Na"},
    {source:"No entiendo",target:"আমি বুঝি না",romanization:"Ami bujhi na"},
    {source:"¿Cuánto cuesta?",target:"এটা কত?",romanization:"Eta koto?"},
    {source:"Adiós",target:"আলবিদা",romanization:"Albida"},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"সাহায্য করুন!",romanization:"Sahajjo korun!"},
    {source:"Llama a la policía",target:"পুলিশ ডাকুন",romanization:"Police dakun"},
    {source:"Necesito un médico",target:"আমার একজন ডাক্তার দরকার",romanization:"Amar ekjon doctor dorkar"},
  ])},
];

// ─── URDU ─────────────────────────────────────────────────────────────────────
const UR = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"السلام علیکم",romanization:"Assalamu alaikum"},
    {source:"Gracias",target:"شکریہ",romanization:"Shukriya"},
    {source:"Por favor",target:"براہ کرم",romanization:"Barah karam"},
    {source:"Sí / No",target:"جی ہاں / نہیں",romanization:"Ji han / Nahin"},
    {source:"No entiendo",target:"مجھے سمجھ نہیں آیا",romanization:"Mujhe samajh nahin aya"},
    {source:"¿Cuánto cuesta?",target:"یہ کتنے کا ہے؟",romanization:"Yeh kitne ka hai?"},
    {source:"Adiós",target:"خدا حافظ",romanization:"Khuda hafiz"},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"مدد کریں!",romanization:"Madad karein!"},
    {source:"Llama a la policía",target:"پولیس کو بلائیں",romanization:"Police ko bulayen"},
    {source:"Necesito un médico",target:"مجھے ڈاکٹر چاہیے",romanization:"Mujhe doctor chahiye"},
  ])},
];

// ─── ESLOVACO ─────────────────────────────────────────────────────────────────
const SK = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Ahoj / Dobrý deň",romanization:null},
    {source:"Gracias",target:"Ďakujem",romanization:null},
    {source:"Por favor",target:"Prosím",romanization:null},
    {source:"Sí / No",target:"Áno / Nie",romanization:null},
    {source:"No entiendo",target:"Nerozumiem",romanization:null},
    {source:"¿Cuánto cuesta?",target:"Koľko to stojí?",romanization:null},
    {source:"Adiós",target:"Dovidenia",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Pomoc!",romanization:null},
    {source:"Llama a la policía",target:"Zavolajte políciu",romanization:null},
    {source:"Necesito un médico",target:"Potrebujem lekára",romanization:null},
  ])},
];

// ─── ESLOVENO ─────────────────────────────────────────────────────────────────
const SL = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Živjo / Dober dan",romanization:null},
    {source:"Gracias",target:"Hvala",romanization:null},
    {source:"Por favor",target:"Prosim",romanization:null},
    {source:"Sí / No",target:"Da / Ne",romanization:null},
    {source:"No entiendo",target:"Ne razumem",romanization:null},
    {source:"Adiós",target:"Nasvidenje",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Na pomoč!",romanization:null},
    {source:"Llama a la policía",target:"Pokličite policijo",romanization:null},
    {source:"Necesito un médico",target:"Potrebujem zdravnika",romanization:null},
  ])},
];

// ─── MALTÉS ───────────────────────────────────────────────────────────────────
const MT = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Bonġu / Merħba",romanization:null},
    {source:"Gracias",target:"Grazzi",romanization:null},
    {source:"Por favor",target:"Jekk jogħġbok",romanization:null},
    {source:"Sí / No",target:"Iva / Le",romanization:null},
    {source:"No entiendo",target:"Ma nifhimx",romanization:null},
    {source:"Adiós",target:"Saħħa",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Għajnuna!",romanization:null},
    {source:"Llama a la policía",target:"Sejjaħ il-pulizija",romanization:null},
    {source:"Necesito un médico",target:"Għandi bżonn tabib",romanization:null},
  ])},
];

// ─── KINYARWANDA ─────────────────────────────────────────────────────────────
const RW = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Muraho",romanization:null},
    {source:"Gracias",target:"Murakoze",romanization:null},
    {source:"Por favor",target:"Mwemere",romanization:null},
    {source:"Sí / No",target:"Yego / Oya",romanization:null},
    {source:"No entiendo",target:"Simbyumva",romanization:null},
    {source:"Adiós",target:"Murabeho",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Fungura!",romanization:null},
    {source:"Llama a la policía",target:"Hamagara polisi",romanization:null},
    {source:"Necesito un médico",target:"Ndashaka muganga",romanization:null},
  ])},
];

// ─── MALGACHE (MADAGASCAR) ────────────────────────────────────────────────────
const MG = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"Manao ahoana",romanization:null},
    {source:"Gracias",target:"Misaotra",romanization:null},
    {source:"Por favor",target:"Azafady",romanization:null},
    {source:"Sí / No",target:"Eny / Tsia",romanization:null},
    {source:"No entiendo",target:"Tsy azoko",romanization:null},
    {source:"Adiós",target:"Veloma",romanization:null},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"Vonjeo!",romanization:null},
    {source:"Llama a la policía",target:"Antsoy ny polisy",romanization:null},
    {source:"Necesito un médico",target:"Mila dokotera aho",romanization:null},
  ])},
];

// ─── PERSA (FARSI) ────────────────────────────────────────────────────────────
const FA = [
  { name:"Básicas", items: p([
    {source:"Hola",target:"سلام",romanization:"Salam"},
    {source:"Buenos días",target:"صبح بخیر",romanization:"Sobh bekheyr"},
    {source:"Gracias",target:"ممنون / متشکرم",romanization:"Mamnun / Moteşakkeram"},
    {source:"Por favor",target:"لطفاً",romanization:"Lotfan"},
    {source:"Perdona",target:"ببخشید",romanization:"Bebakhshid"},
    {source:"Sí / No",target:"بله / نه",romanization:"Bale / Na"},
    {source:"No entiendo",target:"نمی‌فهمم",romanization:"Nemifahmam"},
    {source:"¿Cuánto cuesta?",target:"قیمتش چنده؟",romanization:"Gheymatesh chande?"},
    {source:"Adiós",target:"خداحافظ",romanization:"Khodahafez"},
  ])},
  { name:"Restaurante", items: p([
    {source:"La carta",target:"منو لطفاً",romanization:"Meno lotfan"},
    {source:"La cuenta",target:"صورت حساب لطفاً",romanization:"Surat hesab lotfan"},
    {source:"Agua",target:"آب",romanization:"Ab"},
    {source:"Sin picante",target:"بدون تند",romanization:"Bedune tond"},
    {source:"Está delicioso",target:"خیلی خوشمزه است",romanization:"Kheyli khoshmaze ast"},
  ])},
  { name:"Emergencias", items: p([
    {source:"¡Ayuda!",target:"کمک!",romanization:"Komak!"},
    {source:"Llama a la policía",target:"پلیس خبر کن",romanization:"Polis khabar kon"},
    {source:"Necesito un médico",target:"به دکتر نیاز دارم",romanization:"Be doctor niyaz daram"},
  ])},
];

// ─── MAPA PAÍS → FRASES ──────────────────────────────────────────────────────
export const PHRASES_BY_COUNTRY = {
  // Japonés
  "Japón": JA, "Japan": JA,
  // Francés
  "Francia": FR, "Bélgica": FR, "Suiza": FR, "Luxemburgo": FR,
  "Mónaco": FR, "Senegal": FR, "Camerún": FR, "Haití": FR,
  // Alemán
  "Alemania": DE, "Austria": DE,
  // Italiano
  "Italia": IT,
  // Portugués
  "Portugal": PT, "Brasil": PT, "Angola": PT, "Mozambique": PT,
  "Cabo Verde": PT, "Surinam": PT,
  // Inglés
  "Estados Unidos": EN, "Reino Unido": EN, "Australia": EN,
  "Canadá": EN, "Irlanda": EN, "Nueva Zelanda": EN, "Jamaica": EN,
  "Trinidad y Tobago": EN, "Barbados": EN, "Bahamas": EN,
  "Fiyi": EN, "Ghana": EN, "Nigeria": EN, "Kenia": EN,
  "Tanzania": EN, "Uganda": EN, "Zambia": EN, "Zimbabue": EN,
  "Namibia": EN, "Botsuana": EN, "Guyana": EN, "Singapur": EN,
  "Malta": EN,
  // Neerlandés
  "Países Bajos": NL,
  // Árabe
  "Marruecos": AR, "Egipto": AR, "Jordania": AR, "Líbano": AR,
  "Arabia Saudí": AR, "Emiratos Árabes": AR, "Kuwait": AR,
  "Bahréin": AR, "Qatar": AR, "Omán": AR, "Argelia": AR,
  "Túnez": AR, "Libia": AR, "Sudán": AR,
  // Chino
  "China": ZH, "Taiwan": ZH,
  // Coreano
  "Corea del Sur": KO,
  // Tailandés
  "Tailandia": TH,
  // Vietnamita
  "Vietnam": VI,
  // Indonesio/Malayo
  "Indonesia": ID, "Malasia": ID, "Brunéi": ID,
  // Griego
  "Grecia": EL, "Chipre": EL,
  // Turco
  "Turquía": TR,
  // Hindi
  "India": HI,
  // Ruso
  "Rusia": RU,
  // Polaco
  "Polonia": PL,
  // Checo
  "República Checa": CS,
  // Húngaro
  "Hungría": HU,
  // Croata/Serbio/Bosnio
  "Croacia": HR, "Serbia": HR, "Bosnia": HR, "Montenegro": HR,
  // Rumano
  "Rumanía": RO, "Moldova": RO,
  // Sueco
  "Suecia": SV,
  // Noruego
  "Noruega": NO,
  // Danés
  "Dinamarca": DA,
  // Finlandés
  "Finlandia": FI,
  // Islandés
  "Islandia": IS,
  // Hebreo
  "Israel": HE,
  // Georgiano
  "Georgia": KA,
  // Armenio
  "Armenia": HY,
  // Azerbaiyano
  "Azerbaiyán": AZ,
  // Ucraniano
  "Ucrania": UK,
  // Búlgaro
  "Bulgaria": BG,
  // Albanés
  "Albania": SQ, "Kosovo": SQ,
  // Macedonio
  "Macedonia del Norte": MK,
  // Swahili
  "Kenia": SW, "Tanzania": SW, "Uganda": SW,
  // Filipino
  "Filipinas": FIL,
  // Jemer
  "Camboya": KM,
  // Nepalés
  "Nepal": NE,
  // Amhárico
  "Etiopía": AM,
  // Mongol
  "Mongolia": MN,
  // Kazajo
  "Kazajistán": KK, "Kirguistán": KK,
  // Uzbeko
  "Uzbekistán": UZ,
  // Birmano
  "Myanmar": MY,
  // Lao
  "Laos": LO,
  // Cingalés
  "Sri Lanka": SI,
  // Bielorruso
  "Bielorrusia": BE,
  // Bengalí
  "Bangladés": BN,
  // Urdu
  "Pakistán": UR,
  // Eslovaco
  "Eslovaquia": SK,
  // Esloveno
  "Eslovenia": SL,
  // Maltés
  "Malta": MT,
  // Kinyarwanda
  "Ruanda": RW, "Rwanda": RW,
  // Malgache
  "Madagascar": MG,
  // Persa
  "Irán": FA,
  // Letón
  "Letonia": { categories: [
    { name:"Básicas", items: [
      {source:"Hola",target:"Sveiki",romanization:null},
      {source:"Gracias",target:"Paldies",romanization:null},
      {source:"Por favor",target:"Lūdzu",romanization:null},
      {source:"Sí / No",target:"Jā / Nē",romanization:null},
      {source:"No entiendo",target:"Es nesaprotu",romanization:null},
      {source:"Adiós",target:"Uz redzēšanos",romanization:null},
    ]},
    { name:"Emergencias", items: [
      {source:"¡Ayuda!",target:"Palīgā!",romanization:null},
      {source:"Llama a la policía",target:"Izsauciet policiju",romanization:null},
      {source:"Necesito un médico",target:"Man vajag ārstu",romanization:null},
    ]},
  ]},
  // Lituano
  "Lituania": { categories: [
    { name:"Básicas", items: [
      {source:"Hola",target:"Labas / Sveiki",romanization:null},
      {source:"Gracias",target:"Ačiū",romanization:null},
      {source:"Por favor",target:"Prašau",romanization:null},
      {source:"Sí / No",target:"Taip / Ne",romanization:null},
      {source:"No entiendo",target:"Nesuprantu",romanization:null},
      {source:"Adiós",target:"Viso gero",romanization:null},
    ]},
    { name:"Emergencias", items: [
      {source:"¡Ayuda!",target:"Gelbėkite!",romanization:null},
      {source:"Llama a la policía",target:"Skambinkite policijai",romanization:null},
      {source:"Necesito un médico",target:"Man reikia gydytojo",romanization:null},
    ]},
  ]},
  // Estonio
  "Estonia": { categories: [
    { name:"Básicas", items: [
      {source:"Hola",target:"Tere",romanization:null},
      {source:"Gracias",target:"Tänan",romanization:null},
      {source:"Por favor",target:"Palun",romanization:null},
      {source:"Sí / No",target:"Jah / Ei",romanization:null},
      {source:"No entiendo",target:"Ma ei saa aru",romanization:null},
      {source:"Adiós",target:"Head aega",romanization:null},
    ]},
    { name:"Emergencias", items: [
      {source:"¡Ayuda!",target:"Appi!",romanization:null},
      {source:"Llama a la policía",target:"Helista politseisse",romanization:null},
      {source:"Necesito un médico",target:"Mul on arsti vaja",romanization:null},
    ]},
  ]},
  // Timor Oriental (Tetum/Portugués)
  "Timor Oriental": PT,
  // Bután (Dzongkha)
  "Bután": { categories: [
    { name:"Básicas", items: [
      {source:"Hola",target:"Kuzu Zangpo",romanization:null},
      {source:"Gracias",target:"Kadrin Che",romanization:null},
      {source:"Por favor",target:"Bey Cha",romanization:null},
      {source:"Sí / No",target:"In / Men",romanization:null},
      {source:"Adiós",target:"Log Jay",romanization:null},
    ]},
    { name:"Emergencias", items: [
      {source:"¡Ayuda!",target:"Roga!",romanization:null},
      {source:"Necesito un médico",target:"Nga Men Pa Go",romanization:null},
    ]},
  ]},
  // Maldivas (Dhivehi)
  "Maldivas": { categories: [
    { name:"Básicas", items: [
      {source:"Hola",target:"Assalaamu Alaikum",romanization:null},
      {source:"Gracias",target:"Shukuriyyaa",romanization:null},
      {source:"Por favor",target:"Adheys",romanization:null},
      {source:"Sí / No",target:"Aan / Noon",romanization:null},
      {source:"Adiós",target:"Dhanivaa",romanization:null},
    ]},
    { name:"Emergencias", items: [
      {source:"¡Ayuda!",target:"Gahdhey!",romanization:null},
      {source:"Necesito un médico",target:"Doctors ah beynunvey",romanization:null},
    ]},
  ]},
};

// Fallback para países sin frases definidas — devuelve frases básicas en inglés
export function getPhrasesForCountry(countryName) {
  return PHRASES_BY_COUNTRY[countryName] || null;
}