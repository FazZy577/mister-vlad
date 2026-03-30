exports.handler = async (event) => {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch (e) { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Bad JSON' }) }; }

  const { prompt, model } = body;
  const GEMINI_KEY = process.env.GEMINI_KEY;

  if (!GEMINI_KEY) return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'GEMINI_KEY no configurada en Netlify' }) };
  if (!prompt) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Falta prompt' }) };

  // Intentar varios modelos de Gemini en orden hasta que uno funcione
  const models = [
    model || 'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash-8b',
    'gemini-3-flash-preview'
  ];

  let lastError = '';
  for (const m of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 1400 }
          })
        }
      );
      const data = await res.json();
      if (data.error) {
        lastError = `${m}: ${data.error.message}`;
        // Si es 503 (saturado) o 404 (no existe), probar siguiente
        if (data.error.code === 503 || data.error.code === 404) continue;
        throw new Error(lastError);
      }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ text, model: m }) };
    } catch (e) {
      lastError = e.message;
      continue;
    }
  }

  return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Todos los modelos fallaron: ' + lastError }) };
};
