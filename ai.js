const CLAUDE_KEY = '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';
const OPENAI_KEY = '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';
const GEMINI_KEY = 'AIzaSyDRj-vNN20wx4kpVFKeY1N-bwk5LbicmxU';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };

  let provider, prompt, history;
  try {
    const b = JSON.parse(event.body || '{}');
    provider = b.provider;
    prompt = b.prompt;
    history = b.history || [];
  } catch (e) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Bad JSON: ' + e.message }) };
  }

  if (!provider || !prompt) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing provider or prompt' }) };
  }

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
        body: JSON.stringify({
          model: 'claude-opus-4-5',
          max_tokens: 1400,
          messages
        })
      });
      const raw = await res.text();
      let data;
      try { data = JSON.parse(raw); } catch(e) { throw new Error('Claude returned non-JSON: ' + raw.slice(0,200)); }
      if (data.error) throw new Error('Claude error: ' + JSON.stringify(data.error));
      text = data.content?.[0]?.text || '';

    } else if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + OPENAI_KEY
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const raw = await res.text();
      let data;
      try { data = JSON.parse(raw); } catch(e) { throw new Error('OpenAI returned non-JSON: ' + raw.slice(0,200)); }
      if (data.error) throw new Error('OpenAI error: ' + JSON.stringify(data.error));
      text = data.choices?.[0]?.message?.content || '';

    } else if (provider === 'gemini') {
      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_KEY,
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
      let data;
      try { data = JSON.parse(raw); } catch(e) { throw new Error('Gemini returned non-JSON: ' + raw.slice(0,200)); }
      if (data.error) throw new Error('Gemini error: ' + JSON.stringify(data.error));
      text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    } else {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Unknown provider: ' + provider }) };
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ text }) };

  } catch (err) {
    console.error('Handler error:', err.message);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
