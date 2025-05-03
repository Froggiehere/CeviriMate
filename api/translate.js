// api/translate.js - Vercel serverless function
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests for actual translation
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the DeepL API key and other parameters from the request
    const { auth_key, text, source_lang, target_lang } = req.body;
    
    // Validate required parameters
    if (!auth_key || !text || !target_lang) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    console.log(`Translating from ${source_lang || 'auto'} to ${target_lang}`);

    // Make the request to DeepL API
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        auth_key,
        text,
        source_lang: source_lang || '',
        target_lang,
      }),
    });

    // Handle non-OK responses from DeepL
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DeepL API error (${response.status}):`, errorText);
      return res.status(response.status).json({ 
        error: `DeepL API error: ${response.status}`,
        details: errorText
      });
    }

    // Get the response from DeepL
    const data = await response.json();
    
    // Send the response back to the client
    return res.status(200).json(data);
  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({ 
      error: 'Failed to translate text',
      details: error.message || 'Unknown error'
    });
  }
}