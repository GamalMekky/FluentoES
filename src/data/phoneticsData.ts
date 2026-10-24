import { SpanishSentenceCard } from '../types';

export interface SoundRule {
  id: string;
  letter: string;
  nameAr: string;
  difficultyForEgyptians: 'منخفض' | 'متوسط' | 'مرتفع' | 'حاسم في الكول سنتر';
  mouthTipAr: string;
  egyptianTrapAr: string;
  audioExampleWord: string;
  audioExampleSentence: SpanishSentenceCard;
}

export interface MinimalPair {
  id: string;
  word1: string;
  meaning1Ar: string;
  word2: string;
  meaning2Ar: string;
  targetSoundContrast: string;
  tipAr: string;
  exampleSentence1: SpanishSentenceCard;
  exampleSentence2: SpanishSentenceCard;
}

export const spanishSoundRules: SoundRule[] = [
  {
    id: 'snd_vowels',
    letter: 'A - E - I - O - U',
    nameAr: 'الحركات الصوتية الخمس النقية (Las 5 Vocales)',
    difficultyForEgyptians: 'حاسم في الكول سنتر',
    mouthTipAr: 'في الإسبانية الحركات نقية وقصيرة جداً ولا تمط الحرف أبداً. افتح فمك بشكل ثابت. الـ E ليست كسرة طويلة، والـ O ليست واو مفتوحة كالعامية المصرية، بل دائرية محكمة.',
    egyptianTrapAr: 'المصريون يميلون لخلط E مع I (يقولون "بيسيتا" بدلاً من "بيسيتا" بنطق حرف E نقي)، وخلط O مع U. ضبط الحركات الخمس هو أول ما يجعلك تبدو كمتحدث B2 أصلي.',
    audioExampleWord: 'Mesa / Misa, Peso / Piso',
    audioExampleSentence: {
      id: 'ex_snd_vow',
      spanish: 'El cliente pide una mesa para comer en el restaurante.',
      transliterationAr: 'إل كلينتي بيدي أونا ميسا بارا كومير إن إل ريستاورانتي.',
      ipa: '/el kliˈente ˈpiðe ˈuna ˈmesa ˈpaɾa koˈmeɾ en el restawˈɾante/',
      arabic: 'يطلب العميل طاولة لتناول الطعام في المطعم.',
      register: 'محايد',
    },
  },
  {
    id: 'snd_p_b',
    letter: 'P vs B',
    nameAr: 'فارق P الانفجارية عن B المجهورة',
    difficultyForEgyptians: 'حاسم في الكول سنتر',
    mouthTipAr: 'حرف P في الإسبانية يُنطق بإطباق الشفتين بقوة ثم إطلاق هواء جاف خفيف (بدون صوت في الحبال الصوتية)، بينما B تهتز فيها الأحبال الصوتية مباشرة. تدرب بوضع ورقة أمام فمك، عند نطق P يجب أن تتحرك الورقة!',
    egyptianTrapAr: 'العربية الفصحى والعامية المصرية لا يوجد فيهما صوت P، لذلك ينطق المصريون "بروبليما" بدلاً من "بروبليما" /pɾoˈβlema/. في الكول سنتر هذا الخطأ يربك العميل الإسباني.',
    audioExampleWord: 'Pagar (يدفع) vs Bagar, Pero (لكن) vs Bero',
    audioExampleSentence: {
      id: 'ex_snd_pb',
      spanish: 'Por favor, pulse el botón para confirmar el pago.',
      transliterationAr: 'بور فابور، بولسي إل بوتون بارا كونفيرمار إل باغو.',
      ipa: '/poɾ faˈβoɾ ˈpulse el boˈtom ˈpaɾa komfiɾˈmaɾ el ˈpaɣo/',
      arabic: 'من فضلك، اضغط على الزر لتأكيد عملية الدفع.',
      register: 'رسمي',
      category: 'كول سنتر',
    },
  },
  {
    id: 'snd_rr_r',
    letter: 'RR vs R',
    nameAr: 'الراء المكررة القوية (RR) والراء الخفيفة (R)',
    difficultyForEgyptians: 'مرتفع',
    mouthTipAr: 'الـ R الخفيفة (Flap) ضربة واحدة لطرف اللسان في سقف الحلق خلف الأسنان العلوية (زي راء العامية السريعة). أما RR المشددة فهي اهتزاز متكرر للسان 3 مرات متتالية مع خروج الهواء بقوة.',
    egyptianTrapAr: 'الخلط يغير معنى الكلمة تماماً: Pero (لكن) تصبح Perro (كلب!)، وCaro (غالي) تصبح Carro (سيارة).',
    audioExampleWord: 'Pero (لكن) / Perro (كلب), Caro (غالي) / Carro (عربية)',
    audioExampleSentence: {
      id: 'ex_snd_rr',
      spanish: 'Quería cancelar el contrato de mi carro porque es muy caro.',
      transliterationAr: 'كيريا كانثيلار إل كونتراتو دي مي كارّو بوركي إس موي كارو.',
      ipa: '/keˈɾi.a kanθeˈlaɾ el konˈtɾato ðe mi ˈkaro poɾˈke ez ˈmuj ˈkaɾo/',
      arabic: 'كنت أرغب في إلغاء عقد سيارتي لأنها مكلفة وغالية جداً.',
      register: 'رسمي',
      category: 'كول سنتر',
    },
  },
  {
    id: 'snd_j_g',
    letter: 'J / G (أمام E و I)',
    nameAr: 'حرف الخاء الإسباني (Jota)',
    difficultyForEgyptians: 'متوسط',
    mouthTipAr: 'الـ Jota في مدريد وإسبانيا (/x/) أغلظ وأكثر احتكاكاً من الخاء العربية المعتادة، تخرج من مؤخرة اللسان مع الحنك الرخو. في أمريكا اللاتينية تنطق كـ هاء ناعمة خفيفة (/h/).',
    egyptianTrapAr: 'لا تنطقها أبداً جيماً معطشة مثل الإنجليزية! كلمة Trabajo تنطق "تراباخو" وليس "تراباجو".',
    audioExampleWord: 'Trabajo (عمل), Tarjeta (بطاقة), Genial (رائع)',
    audioExampleSentence: {
      id: 'ex_snd_jg',
      spanish: 'Voy a comprobar los datos de su tarjeta ahora mismo.',
      transliterationAr: 'بوي أ كومبروبار لوس داتوس دي سو تارهيتا أورا ميسمو.',
      ipa: '/ˈboj a kompɾoˈβaɾ loz ˈðatoz ðe su taɾˈxeta aˈoɾa ˈmizmo/',
      arabic: 'سأتحقق من بيانات بطاقة حضرتك في هذه اللحظة بالذات.',
      register: 'رسمي',
      category: 'كول سنتر',
    },
  },
  {
    id: 'snd_b_v',
    letter: 'B = V',
    nameAr: 'حرفا B و V (صوت واحد مطابق تماماً!)',
    difficultyForEgyptians: 'حاسم في الكول سنتر',
    mouthTipAr: 'في الإسبانية لا يوجد إطلاقاً صوت V الإنجليزي (الذي تلامس فيه الأسنان العلوية الشفة السفلية كحرف ف/v). كلاهما (B و V) يُنطقان بالشفتين معاً! إما B انفجارية في بداية الكلام، أو شفتان متقاربتان برقة [β] في وسط الكلمة.',
    egyptianTrapAr: 'المصريون القادمون من الإنجليزية يحاولون نطق V مثل الإنجليزية، فيبدو نطقهم أجنبياً غريباً على الإسبان. تذكر: "Valencia" تبدأ بنفس صوت "Barcelona" تماماً!',
    audioExampleWord: 'Vivir (يحيى / يعيش), Vale (تمام / ماشي), Bilbao (بلباو)',
    audioExampleSentence: {
      id: 'ex_snd_bv',
      spanish: '¿En qué ciudad vive usted actualmente: en Bilbao o en Valencia?',
      transliterationAr: 'إن كي ثيوداد بيبي أوستيد أكتوالمينتي: إن بيلباو أو إن بالينثيا؟',
      ipa: '/eŋ ke θjuˈðað ˈbiβe usˈteð aɡtwalˈmente em bilˈβa.o o em baˈlenθja/',
      arabic: 'في أي مدينة تعيش حضرتك حالياً: في بلباو أم في بلنسية؟',
      register: 'رسمي',
      category: 'كول سنتر',
    },
  },
  {
    id: 'snd_z_c',
    letter: 'Z / C (Ceceo والـ Distinción في إسبانيا)',
    nameAr: 'الثاء الإسبانية (Zaragoza, Gracias)',
    difficultyForEgyptians: 'حاسم في الكول سنتر',
    mouthTipAr: 'في إسبانيا (Castellano)، حرف Z وحرف C (إذا جاء بعده E أو I) يُنطقان ثاء عربية فصيحة صريحة [θ] بوضع طرف اللسان بين الأسنان العلوية والسفلية، بينما S تنطق سيناً مصفورة [s].',
    egyptianTrapAr: 'في العامية المصرية يميل الناس لاستبدال الثاء بالسين أو التاء. في إسبانيا، نطق Gracias كـ "غراثياس" بالثاء هو قمة النطق المدريدي الأصيل.',
    audioExampleWord: 'Gracias (شكراً), Cero (صفر), Zapato (حذاء)',
    audioExampleSentence: {
      id: 'ex_snd_zc',
      spanish: 'Muchas gracias por su paciencia y por llamar al servicio de atención.',
      transliterationAr: 'موتشاس غراثياس بور سو باثيينثيا إي بور يامار أل سيربيثيو دي أتينثيون.',
      ipa: '/ˈmutʃaz ˈɣɾaθjas poɾ su paˈθjenθja i poɾ ʝaˈmaɾ al seɾˈβiθjo ðe atenˈθjon/',
      arabic: 'شكراً جزيلاً لصبر حضرتك ولاتصالك بخدمة رعاية العملاء.',
      register: 'رسمي',
      category: 'كول سنتر',
    },
  },
];

export const minimalPairsList: MinimalPair[] = [
  {
    id: 'mp_1',
    word1: 'Pero',
    meaning1Ar: 'لكن / ولكن',
    word2: 'Perro',
    meaning2Ar: 'كلب',
    targetSoundContrast: 'R خفيفة [ɾ] مقابل RR قوية مشددة [r]',
    tipAr: 'في Pero طرف لسانك يلمس سقف الحلق لمسة سريعة واحدة، بينما في Perro لسانك يرتعش ويهتز بقوة.',
    exampleSentence1: {
      id: 'mp1_s1',
      spanish: 'Entiendo su problema, pero el sistema no permite el cambio.',
      transliterationAr: 'إنتييندو سو بروبليما، بيرو إل سيستيما نو بيرميتي إل كامبيو.',
      ipa: '/enˈtjendo su pɾoˈβlema ˈpeɾo el sisˈtema no peɾˈmite el ˈkambjo/',
      arabic: 'أفهم مشكلة حضرتك، ولكن النظام لا يسمح بإجراء التغيير.',
      register: 'رسمي',
    },
    exampleSentence2: {
      id: 'mp1_s2',
      spanish: 'El cliente tiene un perro que ladra mucho durante la llamada.',
      transliterationAr: 'إل كلينتي تييني أون بيرّو كي لادرا موتشو دورانتي لا يامادا.',
      ipa: '/el kliˈente ˈtjene um ˈpero ke ˈlaðɾa ˈmutʃo ðuˈɾante la ʝaˈmaða/',
      arabic: 'العميل لديه كلب ينبح بصوت عالٍ أثناء المكالمة.',
      register: 'محايد',
    },
  },
  {
    id: 'mp_2',
    word1: 'Casa',
    meaning1Ar: 'منزل / بيت',
    word2: 'Caza',
    meaning2Ar: 'صيد (أو يصطاد)',
    targetSoundContrast: 'S [s] مقابل Z [θ] ثاء في إسبانيا',
    tipAr: 'Casa بـ سين صافية، بينما Caza بـ ثاء فصيحة مع طرف اللسان بين الأسنان.',
    exampleSentence1: {
      id: 'mp2_s1',
      spanish: 'Enviaremos al técnico a su casa mañana a las diez.',
      transliterationAr: 'إنبياريموس أل تيكنيكو أ سو كاسا مانيانا أ لاس دييث.',
      ipa: '/embjaˈɾemos al ˈteɡniko a su ˈkasa maˈɲana a laz ˈðjeθ/',
      arabic: 'سنرسل الفني إلى منزل حضرتك غداً في تمام العاشرة.',
      register: 'رسمي',
    },
    exampleSentence2: {
      id: 'mp2_s2',
      spanish: 'La temporada de caza comienza en el mes de octubre.',
      transliterationAr: 'لا تيمبورادا دي كاثا كوميينثا إن إل ميس دي أوكتوبري.',
      ipa: '/la tempoˈɾaða ðe ˈkaθa koˈmjenθa en el mez ðe okˈtuβɾe/',
      arabic: 'موسم الصيد يبدأ في شهر أكتوبر.',
      register: 'محايد',
    },
  },
  {
    id: 'mp_3',
    word1: 'Pagar',
    meaning1Ar: 'يدفع المال',
    word2: 'Bajar',
    meaning2Ar: 'يخفض / ينزل',
    targetSoundContrast: 'P انفجارية مقابل B مجهورة + G/J',
    tipAr: 'احذر أن تنطق Pagar مثل Bagar! أطلق هواء خفيفاً عند نطق P.',
    exampleSentence1: {
      id: 'mp3_s1',
      spanish: 'Puede pagar su recibo mediante tarjeta bancaria o transferencia.',
      transliterationAr: 'بويدي با غار سو ريثيبو ميديانتي تارهيتا بانكاريا أو ترانسفيرينثيا.',
      ipa: '/ˈpweðe paˈɣaɾ su reˈθiβo meˈðjante taɾˈxeta baŋˈkaɾja o tɾansfeˈɾenθja/',
      arabic: 'يمكن لحضرتك سداد فاتورتك بواسطة البطاقة البنكية أو التحويل.',
      register: 'رسمي',
    },
    exampleSentence2: {
      id: 'mp3_s2',
      spanish: 'Vamos a bajar la velocidad de su línea temporalmente.',
      transliterationAr: 'باموس أ باخار لا بيلوثيداد دي سو لينيا تيمبورالمينتي.',
      ipa: '/ˈbamoz a baˈxaɾ la βeloθiˈðað ðe su ˈline.a tempoˈɾalˈmente/',
      arabic: 'سنقوم بتخفيض سرعة خط حضرتك بشكل مؤقت.',
      register: 'رسمي',
    },
  },
];
