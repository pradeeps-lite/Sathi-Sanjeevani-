import https from 'https';
import { GoogleGenAI } from '@google/genai';

function fetchGoogleTTSChunk(chunk: string, langCode: string): Promise<Buffer> {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${langCode}&client=tw-ob`;
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: '*/*',
        },
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          return reject(new Error(`TTS upstream error: ${res.statusCode}`));
        }
        const chunks: Buffer[] = [];
        res.on('data', (d) => chunks.push(d));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }
    );
    req.on('error', reject);
    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error('TTS timeout'));
    });
  });
}

async function generateSpeechAudio(text: string, language: string): Promise<{ audioBase64: string; mimeType: string }> {
  const isTelugu = language.includes('తెలుగు') || language.toLowerCase().includes('telugu');
  const isHindi = language.includes('हिंदी') || language.toLowerCase().includes('hindi');
  const langCode = isTelugu ? 'te' : isHindi ? 'hi' : 'en';

  const clean = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s?/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[•\-\_~`>]/g, ' ')
    .replace(/\n+/g, '. ')
    .trim();

  const rawSentences = clean.split(/(?<=[.?!।|॥])\s+/);
  const chunks: string[] = [];
  let current = '';

  const maxChunkLength = isTelugu || isHindi ? 90 : 140;

  for (const s of rawSentences) {
    if ((current + ' ' + s).length <= maxChunkLength) {
      current = current ? current + ' ' + s : s;
    } else {
      if (current) chunks.push(current);
      if (s.length > maxChunkLength) {
        for (let i = 0; i < s.length; i += maxChunkLength) {
          chunks.push(s.slice(i, i + maxChunkLength));
        }
        current = '';
      } else {
        current = s;
      }
    }
  }
  if (current) chunks.push(current);

  const limitedChunks = chunks.slice(0, 8);
  const audioBuffers: Buffer[] = [];

  for (const chunk of limitedChunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;
    try {
      const buf = await fetchGoogleTTSChunk(trimmed, langCode);
      if (buf && buf.length > 0) {
        audioBuffers.push(buf);
      }
    } catch (e) {
      console.warn('TTS chunk failed:', e);
    }
  }

  const combined = Buffer.concat(audioBuffers);
  return {
    audioBase64: combined.toString('base64'),
    mimeType: 'audio/mpeg',
  };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const message = body?.message || '';
    const language = body?.language || 'Telugu';

    const isTelugu = language.includes('తెలుగు') || language.toLowerCase().includes('telugu');
    const isHindi = language.includes('हिंदी') || language.toLowerCase().includes('hindi');

    let replyText = '';
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI();
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `You are Sanjeevani AI, a compassionate healthcare assistant for rural India.
The user's query is: "${message}".
Language: Respond ONLY in ${language}.
Keep advice practical, simple, encouraging, and easy to understand.
Always include home care, hydration, rest, and specify when to visit the nearest Primary Health Center (PHC).
Format in 3 to 4 short, clear sentences.`,
        });
        replyText = response.text || '';
      } catch (geminiErr) {
        console.warn('Gemini generateContent error in Vercel function:', geminiErr);
      }
    }

    if (!replyText) {
      if (isTelugu) {
        replyText = `"${message}" కోసం: దయచేసి తగినంత విశ్రాంతి తీసుకోండి, కాచి చల్లార్చిన స్వచ్ఛమైన నీరు మరియు ఓఆర్‌ఎస్ (ORS) పుష్కలంగా త్రాగండి. జ్వరం లేదా నొప్పి తీవ్రంగా ఉంటే లేదా 2-3 రోజులకు మించి కొనసాగితే, దయచేసి మీ సమీప ప్రాథమిక ఆరోగ్య కేంద్రాన్ని (PHC) సంప్రదించండి.`;
      } else if (isHindi) {
        replyText = `"${message}" के लिए: कृपया पर्याप्त आराम करें, उबला हुआ स्वच्छ पानी और ओआरएस (ORS) घोल पिएं। यदि बुखार या दर्द 2-3 दिनों से अधिक रहे, तो तुरंत अपने नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) में डॉक्टर को दिखाएं।`;
      } else {
        replyText = `For "${message}", please rest well, drink plenty of clean boiled water or ORS fluids, and stay warm. If your symptoms or discomfort persist for more than 2-3 days, please visit your nearest Primary Health Center (PHC) for clinical care.`;
      }
    }

    // Generate speech audio (Using Gemini TTS for Telugu; standard for Hindi / English)
    let audioBase64: string | null = null;
    let mimeType = 'audio/mpeg';

    if (isTelugu && apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const cleanText = replyText
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/#{1,6}\s?/g, '')
          .replace(/\[(.*?)\]\(.*?\)/g, '$1')
          .slice(0, 400);

        const ttsRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [{ role: 'user', parts: [{ text: cleanText }] }],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
            },
          },
        });

        const gAudio = ttsRes.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (gAudio) {
          audioBase64 = gAudio;
          mimeType = ttsRes.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || 'audio/wav';
        }
      } catch (geminiTtsErr) {
        console.warn('Gemini Telugu TTS in chat failed, falling back:', geminiTtsErr);
      }
    }

    if (!audioBase64) {
      try {
        const speechRes = await generateSpeechAudio(replyText, language);
        if (speechRes?.audioBase64) {
          audioBase64 = speechRes.audioBase64;
          mimeType = speechRes.mimeType;
        }
      } catch (ttsErr) {
        console.warn('Vercel TTS audio generation failed:', ttsErr);
      }
    }

    res.status(200).json({
      reply: replyText,
      audioBase64,
      mimeType,
      language,
      disclaimer: isTelugu
        ? 'సంజీవని AI ప్రాథమిక ఆరోగ్య సమాచార సహాయకుడు మాత్రమే, వైద్య నిర్ధారణ కాదు.'
        : isHindi
        ? 'संजीवनी AI केवल स्वास्थ्य मार्गदर्शन है, चिकित्सीय निदान नहीं।'
        : 'Sanjeevani AI provides supportive health information, not a formal diagnosis.',
      suggestedActions: isTelugu
        ? ['సమీప PHC క్లినిక్', 'మందుల రిమైండర్', 'అత్యవసర 112 కాల్']
        : isHindi
        ? ['नजदीकी PHC अस्पताल', 'दवा रिमाइंडर', 'इमरजेंसी 112 कॉल']
        : ['Find Nearest PHC', 'Set Medicine Reminder', 'Emergency Call 112'],
    });
  } catch (err: any) {
    console.error('Vercel chat handler error:', err);
    res.status(500).json({ error: err?.message || 'Chat handling failed' });
  }
}
