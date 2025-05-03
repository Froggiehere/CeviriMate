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
    1. En sık kullanılan ifadelerin (top 10) bir listesini ver. Benzer olanları grupla.
    2. Çeviri sürecini ve yazı kalitesini geliştirmeye yönelik öneriler sun.
    3. Sadece düz metin kullan — markdown, madde işareti veya sembol kullanma.
    4. Maddeleri numaralandır ve bölümleri açık başlıklarla ayır.
    5. Açıklamalar Türkçe olacak, metinler orijinal dilinde kalacak.
    6. Okunabilirlik için boşluklara dikkat et, düzenli yaz.
    7. Türkçe yazarken daima Türkçe karakterler kullan: ç, ğ, ö, ş, ü, ı gibi.
    8. Eğer metin çok kısaysa "Analiz için yeterli veri yok." yaz.
    9. Unutma: Türkçe karakter kullanımı çok önemlidir. Yanlışlıkla ASCII karşılıklarını (g, s, i, u gibi) kullanma.
    
    Metinler:
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
