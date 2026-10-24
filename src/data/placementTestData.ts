import { CEFRLevel } from '../types';

export interface PlacementQuestion {
  id: string;
  level: CEFRLevel;
  question: string;
  questionAr: string;
  options: string[];
  correctAnswer: string;
  explanationAr: string;
}

export const placementQuestions: PlacementQuestion[] = [
  {
    id: 'pq_1',
    level: 'A1',
    question: 'Buenos días, ¿cómo _______ usted?',
    questionAr: 'أكمل بصيغة الاحترام للتحية: "صباح الخير، كيف حال حضرتك؟"',
    options: ['está', 'estás', 'estoy', 'están'],
    correctAnswer: 'está',
    explanationAr: 'مع صيغة الاحترام Usted نستخدم تصريف الغائب المفرد: está.',
  },
  {
    id: 'pq_2',
    level: 'A1',
    question: 'En el call center nosotros _______ muchas llamadas al día.',
    questionAr: 'اختر تصريف فعل Recibir مع Nosotros:',
    options: ['recibimos', 'reciben', 'recibo', 'recibís'],
    correctAnswer: 'recibimos',
    explanationAr: 'الأفعال المنتهية بـ -ir تأخذ -imos مع nosotros: recibimos.',
  },
  {
    id: 'pq_3',
    level: 'A1',
    question: 'Hoy el supervisor _______ un correo a todo el equipo.',
    questionAr: 'اختر الزمن المناسب مع كلمة Hoy (اليوم) في إسبانيا:',
    options: ['ha enviado', 'envió', 'enviará', 'enviaba'],
    correctAnswer: 'ha enviado',
    explanationAr: 'مع زمن لم ينتهِ مثل Hoy في إسبانيا نستخدم Pretérito Perfecto Compuesto: ha enviado.',
  },
  {
    id: 'pq_4',
    level: 'A2',
    question: 'Ayer a las tres de la tarde _______ el contrato con el cliente.',
    questionAr: 'اختر الزمن المناسب مع Ayer (أمس):',
    options: ['firmé', 'he firmado', 'firmaba', 'firmo'],
    correctAnswer: 'firmé',
    explanationAr: 'مع كلمة Ayer وتوقيت محدد مغلق في الماضي نستخدم Pretérito Indefinido: firmé.',
  },
  {
    id: 'pq_5',
    level: 'A2',
    question: 'Cuando yo era nuevo en la empresa, no _______ usar el sistema.',
    questionAr: 'اختر صيغة الوصف والعادة في الماضي (Pretérito Imperfecto):',
    options: ['sabía', 'supe', 'sé', 'sabré'],
    correctAnswer: 'sabía',
    explanationAr: 'لوصف حالة مستمرة في الماضي نستخدم Imperfecto: sabía.',
  },
  {
    id: 'pq_6',
    level: 'B1',
    question: '¿_______ usted tan amable de esperar un minuto en línea?',
    questionAr: 'اختر صيغة التأدب الأقصى (Condicional): "هل يمكن لحضرتك أن تتكرم بالانتظار؟"',
    options: ['Sería', 'Era', 'Fue', 'Sea'],
    correctAnswer: 'Sería',
    explanationAr: 'صيغة Condicional للتأدب في الكول سنتر: ¿Sería tan amable...? أو ¿Podría...?.',
  },
  {
    id: 'pq_7',
    level: 'B1',
    question: 'Es necesario que usted _______ su contraseña para acceder.',
    questionAr: 'أكمل بصيغة الـ Subjuntivo المطلوبة بعد Es necesario que:',
    options: ['cambie', 'cambia', 'cambió', 'cambiar'],
    correctAnswer: 'cambie',
    explanationAr: 'بعد التركيب غير الشخصي الدال على الضرورة (Es necesario que) نستخدم Subjuntivo: cambie.',
  },
  {
    id: 'pq_8',
    level: 'B1',
    question: 'No se _______ señor García, nosotros nos encargamos de todo.',
    questionAr: 'اختر صيغة الأمر المنفي المؤدب: "لا تقلق يا سيد غارسيا":',
    options: ['preocupe', 'preocupes', 'preocupa', 'preocupad'],
    correctAnswer: 'preocupe',
    explanationAr: 'مع Usted صيغة الأمر المنفي من preocuparse هي: No se preocupe.',
  },
  {
    id: 'pq_9',
    level: 'B2',
    question: 'Si _______ en mi mano, le cancelaría la penalización ahora mismo.',
    questionAr: 'اختر التركيب الشرطي الافتراضي B2:',
    options: ['estuviera', 'estaría', 'está', 'estuvo'],
    correctAnswer: 'estuviera',
    explanationAr: 'بعد أداة الشرط Si في الحالات الافتراضية نستخدم Imperfecto de Subjuntivo: estuviera.',
  },
  {
    id: 'pq_10',
    level: 'B2',
    question: 'El cliente me aseguró que ya _______ la factura la semana anterior.',
    questionAr: 'اختر صيغة الكلام المنقول لما حدث قبل حدث آخر بالماضي (Pluscuamperfecto):',
    options: ['había pagado', 'ha pagado', 'pagó', 'pagará'],
    correctAnswer: 'había pagado',
    explanationAr: 'في الكلام المنقول نستخدم Pluscuamperfecto (había pagado) للتعبير عما تم قبل زمن الإخبار.',
  },
];
