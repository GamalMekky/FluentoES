import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to clean JSON string from markdown code blocks
function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

// 1. Pronunciation Analysis Endpoint
app.post('/api/gemini/analyze-pronunciation', async (req, res) => {
  try {
    const { targetSentence, audioBase64, mimeType = 'audio/webm', dialect = 'Spain (Castellano)' } = req.body;

    if (!targetSentence) {
      return res.status(400).json({ error: 'Target sentence is required' });
    }

    const systemPrompt = `You are an expert Spanish phonetician and linguist specializing in teaching Egyptian Arabic native speakers learning Spanish (${dialect}) for working in customer service / call centers.
Analyze the user's recorded pronunciation against the target sentence: "${targetSentence}".
Be particularly attentive to phonological difficulties typical for Arabic speakers:
- P vs B distinction (Arabic lacks /p/)
- Trilled RR /r/ vs flap R /ɾ/
- Pure 5 vowels (e.g. confusing Spanish /e/ and /i/, or /o/ and /u/)
- D and B/V fricative allophones [ð], [β]
- Spanish J /x/ vs Arabic /x/ or /ħ/
- Spain Z/C [θ] vs S [s] in Castellano
- Stress accent (accento prosódico) and word linking (sinalefa)

Return STRICT JSON ONLY matching this format:
{
  "transcript_heard": "string (what you heard the user say)",
  "overall_score_0_100": number,
  "word_by_word": [
    {
      "word": "string",
      "ok": boolean,
      "problem": "string (brief issue in English or Arabic)",
      "tip_ar": "string (practical mouth-position tip in friendly Egyptian Arabic, e.g. خفف الضغط على شفايفك)"
    }
  ],
  "problem_sounds": ["string of sounds like /p/, /rr/, /e/"],
  "corrected_version": "string",
  "natural_alternative_street": "string (how a native would say this naturally in spoken daily Spanish)",
  "is_alternative_used_in_real_street_speech": boolean,
  "explanation_ar": "string (clear, encouraging Egyptian-friendly Arabic feedback on their performance)"
}`;

    let contents: any;
    if (audioBase64) {
      // Multimodal audio input
      contents = {
        parts: [
          {
            inlineData: {
              mimeType: mimeType.split(';')[0], // e.g. audio/webm or audio/wav
              data: audioBase64,
            },
          },
          {
            text: `Target sentence: "${targetSentence}". Dialect: ${dialect}. Analyze this audio pronunciation in detail.`,
          },
        ],
      };
    } else {
      // Fallback if no audio payload provided
      contents = `Target sentence: "${targetSentence}". Dialect: ${dialect}. Give phonetic tips for an Egyptian Arabic speaker.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(cleanJsonResponse(response.text || '{}'));
    return res.json(parsed);
  } catch (error: any) {
    console.error('Pronunciation analysis error:', error);
    return res.status(500).json({
      error: 'حدث خطأ أثناء تحليل النطق، برجاء المحاولة مرة أخرى.',
      details: error.message,
    });
  }
});

// 2. AI Tutor Chat Endpoint
app.post('/api/gemini/tutor-chat', async (req, res) => {
  try {
    const { messages, mode = 'explain_ar', level = 'A2', dialect = 'Spain (Castellano)', userMistakes = [] } = req.body;

    const modeInstructions: Record<string, string> = {
      explain_ar: 'You are Don Rafael, an encouraging Spanish tutor for Egyptian Arabic speakers. Explain grammar, vocabulary, or culture in clear, friendly Egyptian/MSA Arabic. Give vivid examples with Spanish pronunciation in Arabic letters and register notes.',
      conversation_es: 'You are Don Rafael. Have a natural conversation in Spanish suitable for level ' + level + '. Correct the user gently at the end of your response with a quick Arabic breakdown of mistakes.',
      strict_corrector: 'Act as a strict call-center Spanish trainer. Evaluate the user’s grammar, register (formal "usted"), word choice, and tone. Point out every error, provide the corrected Spanish version, and explain in Arabic why.',
      roleplay: 'Act as an authentic Spanish speaker (customer, colleague, or friend). Stay in character. Use natural conversational phrases, idioms, and call center vocabulary when relevant.',
    };

    const systemInstruction = `You are "Fluento ES Tutor" (Don Rafael), an elite Spanish language coach dedicated to helping an Egyptian Arabic native reach CEFR B2 in 3 months to work in an international call center in Spain or Latin America.
Target Dialect: ${dialect}.
Learner Current Level: ${level}.
Recent user weak points / mistakes: ${JSON.stringify(userMistakes.slice(0, 5))}.

Mode: ${modeInstructions[mode] || modeInstructions.explain_ar}

When returning Spanish sentences, ensure they are natural and include pronunciation guides in Arabic script and register tags where appropriate. Always be supportive, practical, and focus on oral fluency and call-center confidence.`;

    const chatContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: chatContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Tutor chat error:', error);
    return res.status(500).json({
      error: 'عذراً، حدث خطأ في الاتصال بالمدرّس الذكي.',
      details: error.message,
    });
  }
});

// 3. Call Center Role-play Simulation Endpoint
app.post('/api/gemini/callcenter-roleplay', async (req, res) => {
  try {
    const {
      scenarioTitle,
      customerPersona, // e.g. "angry", "confused", "fast_speaker", "calm", "regional_andaluz"
      history = [],
      lastAgentMessage,
      dialect = 'Spain (Castellano)',
    } = req.body;

    const personaDescriptions: Record<string, string> = {
      angry: 'A furious customer with an unexpected charge on their bill. Speaking sharply, impatient, demanding an immediate refund.',
      confused: 'An elderly customer who cannot configure their fiber optic router or mobile settings. Talks slowly, asks repetitive questions.',
      fast_speaker: 'A busy executive on the train speaking very quickly with contractions and idiomatic Spanish.',
      calm: 'A polite, cooperative customer asking to renew their contract with a better rate.',
      regional_andaluz: 'A friendly Andalusian customer using southern Spanish expressions and fast rhythm.',
    };

    const systemInstruction = `You are simulating a customer calling a customer service center in Spain (${dialect}).
Customer persona: ${personaDescriptions[customerPersona] || 'A typical customer with an inquiry'}.
Scenario: ${scenarioTitle}.

Analyze the agent's latest answer: "${lastAgentMessage || ''}".
Rate the agent on:
- Politeness & Formal Register (Use of "Usted", courteous phrases like "Disculpe las molestias", "Con mucho gusto")
- Accuracy & Problem Solving
- Tone (de-escalation, empathy)

Then provide:
1. The customer's realistic next line in spoken Spanish.
2. An evaluation score (0-100).
3. The "Ideal Agent Answer" (Frase ideal del agente) that a B2 call-center agent should say.
4. An Arabic breakdown in Egyptian Arabic explaining what was good, what mistakes happened, and how to improve.

Return STRICT JSON ONLY:
{
  "customer_reply": "string (Spanish sentence spoken by customer)",
  "customer_mood": "angry" | "neutral" | "satisfied" | "calming_down",
  "score_0_100": number,
  "tone_feedback_ar": "string",
  "politeness_feedback_ar": "string",
  "ideal_agent_answer_es": "string",
  "ideal_agent_answer_transliteration_ar": "string",
  "ideal_agent_answer_ar": "string",
  "call_status": "in_progress" | "resolved" | "escalated"
}`;

    const formattedContents = [
      ...history.map((h: any) => ({
        role: h.role === 'customer' ? 'model' : 'user',
        parts: [{ text: h.text }],
      })),
      {
        role: 'user',
        parts: [{ text: `Agent says: "${lastAgentMessage}". Customer persona is: ${customerPersona}. Scenario: ${scenarioTitle}.` }],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.6,
      },
    });

    const parsed = JSON.parse(cleanJsonResponse(response.text || '{}'));
    return res.json(parsed);
  } catch (error: any) {
    console.error('Callcenter roleplay error:', error);
    return res.status(500).json({
      error: 'حدث خطأ في محاكاة المكالمة.',
      details: error.message,
    });
  }
});

// 4. "Would a native say this?" Checker
app.post('/api/gemini/native-checker', async (req, res) => {
  try {
    const { sentence, dialect = 'Spain (Castellano)', context = 'general' } = req.body;

    const systemInstruction = `You are an expert native Spanish sociolinguist.
The user wants to know if native Spanish speakers (${dialect}) actually say this sentence: "${sentence}".
Context: ${context}.

Evaluate the sentence for:
1. Naturalness: is it textbook / robotic, completely natural, or slang?
2. Call Center appropriateness: Is it suitable for talking to a customer under "usted" register, or forbidden because it's too casual/rude?
3. Dialect differences: How does Spain vs Latin America differ for this?

Return STRICT JSON:
{
  "naturalness_rating": "textbook" | "natural" | "street_slang" | "unnatural_error",
  "call_center_appropriate": boolean,
  "register": "رسمي" | "محايد" | "عامي" | "شارع" | "إيحاء فظ ⚠️",
  "verdict_ar": "string (Egyptian Arabic summary of whether natives say this)",
  "natural_alternatives": [
    {
      "spanish": "string",
      "transliteration_ar": "string",
      "arabic": "string",
      "register": "string",
      "really_used_in_street": boolean,
      "notes_ar": "string"
    }
  ],
  "call_center_formal_version": {
    "spanish": "string",
    "transliteration_ar": "string",
    "arabic": "string"
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Sentence: "${sentence}". Dialect: ${dialect}. Context: ${context}.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(cleanJsonResponse(response.text || '{}'));
    return res.json(parsed);
  } catch (error: any) {
    console.error('Native checker error:', error);
    return res.status(500).json({ error: 'حدث خطأ في فحص العبارة.' });
  }
});

// 5. Fluency Drill / 60-Second Speaking Evaluation
app.post('/api/gemini/fluency-drill', async (req, res) => {
  try {
    const { topic, transcript, durationSeconds = 60, audioBase64 } = req.body;

    const systemInstruction = `You are a Spanish fluency assessor for call center hiring (DELE B2 oral examiner).
The candidate spoke for ${durationSeconds} seconds on the topic: "${topic}".
Transcript of what was said: "${transcript}".

Evaluate:
- Fluency, speech flow & pauses
- Grammatical accuracy (tense consistency, ser/estar, por/para, subjunctive)
- Vocabulary range & filler words (muletillas like "ehh", "o sea", "bueno")
- B2 Call Center readiness level

Return STRICT JSON:
{
  "words_per_minute": number,
  "overall_fluency_score": number,
  "grammar_score": number,
  "vocabulary_score": number,
  "filler_words_detected": ["string"],
  "grammar_mistakes": [
    {
      "original": "string",
      "correction": "string",
      "reason_ar": "string (in friendly Egyptian Arabic)"
    }
  ],
  "improved_b2_version": "string (how a fluent B2 call center agent would speak on this topic)",
  "improved_b2_ar": "string",
  "coach_feedback_ar": "string"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Topic: ${topic}. Speech transcript: ${transcript}.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(cleanJsonResponse(response.text || '{}'));
    return res.json(parsed);
  } catch (error: any) {
    console.error('Fluency drill error:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء تقييم الطلاقة.' });
  }
});

// 6. Writing Lab Evaluation (DELE B1/B2 & Call Center emails/notes)
app.post('/api/gemini/writing-eval', async (req, res) => {
  try {
    const { text, taskType = 'customer_email', dialect = 'Spain (Castellano)' } = req.body;

    const systemInstruction = `You are a senior Spanish quality-assurance evaluator for B2 call centers and DELE writing exams.
Evaluate the candidate's written customer response or email:
"${text}"
Task type: ${taskType}.
Dialect: ${dialect}.

Analyze:
1. Formal register ("Usted", polite formulas: "Estimado/a", "Atentamente", "Quedamos a su disposición")
2. Orthography, accents (tildes: cómo, cuándo, qué, verb accents), punctuation (¿? ¡!)
3. Grammar errors with tracked changes
4. Professional B2 rewrite

Return STRICT JSON:
{
  "score_0_100": number,
  "cefr_level_achieved": "A1" | "A2" | "B1" | "B2" | "C1",
  "tracked_changes": [
    {
      "original": "string",
      "suggested": "string",
      "rule_ar": "string (explanation in Egyptian/MSA Arabic)"
    }
  ],
  "professional_b2_rewrite": "string",
  "rewrite_ar": "string",
  "general_feedback_ar": "string",
  "key_callcenter_phrases_to_remember": [
    {
      "spanish": "string",
      "arabic": "string"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Candidate text: "${text}". Task: ${taskType}.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(cleanJsonResponse(response.text || '{}'));
    return res.json(parsed);
  } catch (error: any) {
    console.error('Writing eval error:', error);
    return res.status(500).json({ error: 'حدث خطأ في تصحيح الكتابة.' });
  }
});

// Vite & Static file serving setup
const PORT = 3000;
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fluento ES server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
