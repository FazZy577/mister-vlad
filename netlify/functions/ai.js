exports.handler = async (event) => {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };

  let provider, prompt, history;
  try {
    const b = JSON.parse(event.body || '{}');
    provider = b.provider;
    prompt = b.prompt;
    history = b.history || [];
  } catch (e) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Bad JSON' }) };
  }

  // Keys desde variables de entorno de Netlify (nunca en el código)
  const CLAUDE_KEY = process.env.CLAUDE_KEY;
  const OPENAI_KEY = process.env.OPENAI_KEY;
  const GEMINI_KEY = process.env.GEMINI_KEY;

  try {
    let text = '';

    if (provider === 'claude') {
      const messages = [...history, { role: 'user', content: prompt }];
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1400, messages })
      });
      const raw = await res.text();
      const data = JSON.parse(raw);
      if (data.error) throw new Error('Claude: ' + JSON.stringify(data.error));
      text = data.content?.[0]?.text || '';

    } else if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + OPENAI_KEY
        },
        body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] })
      });
      const raw = await res.text();
      const data = JSON.parse(raw);
      if (data.error) throw new Error('OpenAI: ' + JSON.stringify(data.error));
      text = data.choices?.[0]?.message?.content || '';

    } else if (provider === 'gemini') {
      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_KEY,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 1000 }
          })
        }
      );
      const raw = await res.text();
      const data = JSON.parse(raw);
      if (data.error) throw new Error('Gemini: ' + JSON.stringify(data.error));
      text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    } else {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Unknown provider: ' + provider }) };
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ text }) };

  } catch (err) {
    console.error('Error:', err.message);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
