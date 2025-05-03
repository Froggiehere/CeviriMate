export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { texts } = req.body;

  if (!texts || !Array.isArray(texts)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const joinedTexts = texts
    .map((t, i) => `Text ${i + 1}:\n${t}`)
    .join('\n\n');

  const prompt = `
You're a linguistic analysis tool. Analyze the following collection of texts and return:
1. A list of the most frequently used phrases (top 10), grouped when possible.
2. Recommendations for improving the translation process and writing quality.
3. Use plain text only — no markdown, bullets, or symbols.
4. Use a numbered list format to structure items and clear section titles.
5. Write in Turkish, but keep the source texts in English.
6. Keep spacing and readability clean and consistent.

Texts:
${joinedTexts}
`;

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=' +
        process.env.VITE_gemini_apiKey,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
              ],
            },
          ],
        }),
      }
    );

    const result = await response.json();
    res.status(200).json(result);
  } catch (err) {
    console.error('Error calling Gemini:', err);
    res.status(500).json({ error: 'Internal error', details: err.message });
  }
}
