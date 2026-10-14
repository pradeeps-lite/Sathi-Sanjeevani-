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

  // Split into manageable sentence chunks
  const rawSentences = clean.split(/(?<=[.?!।|॥])\s+/);
  const chunks: string[] = [];
  let current = '';

  const maxChunkLength = isTelugu || isHindi ? 65 : 140;

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
  // Enable CORS for Vercel deployments
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

    const text = body?.text || '';
    const language = body?.language || 'English';

    if (!text) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    const isTelugu = language.includes('తెలుగు') || language.toLowerCase().includes('telugu');

    // 1. For Telugu: Use the existing Gemini TTS model (gemini-3.8-flash-lite-tts) from Google AI Studio
    if (isTelugu && process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const cleanText = text
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/#{1,6}\s?/g, '')
          .replace(/\[(.*?)\]\(.*?\)/g, '$1')
          .slice(0, 400);

        const ttsResponse = await ai.models.generateContent({
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

        const audioBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        const mimeType = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || 'audio/wav';

        if (audioBase64) {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
          return res.status(200).json({
            audioBase64,
            format: mimeType,
            mimeType,
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini Telugu TTS failed in Vercel handler, falling back to standard generator:', geminiErr);
      }
    }

    // 2. Hindi, English, or fallback: Standard audio generator
    const result = await generateSpeechAudio(text, language);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.status(200).json(result);
  } catch (err: any) {
    console.error('Vercel TTS handler error:', err);
    res.status(500).json({ error: err?.message || 'TTS generation failed' });
  }
}
