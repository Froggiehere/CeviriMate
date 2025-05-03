import { useLocation } from 'react-router-dom';

export const TranslationAnalysis: React.FC = () => {
  const location = useLocation();
  const analysisResult = location.state?.analysisResult;

  if (!analysisResult) {
    return <div className="text-gray-500 p-4">No analysis result found.</div>;
  }

  // Extract text parts safely from Gemini response
  const parts = analysisResult.candidates?.[0]?.content?.parts ?? [];

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-semibold">Çeviri Analizi</h2>

      {parts.length > 0 ? (
        <div className="space-y-4">
          {parts.map((part: any, index: number) => (
            <div key={index} className="bg-gray-100 p-4 rounded shadow-sm">
              <p className="whitespace-pre-line text-gray-800">{part.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No content found in analysis result.</p>
      )}

      <div className="mt-6">
        <h4 className="text-sm font-medium mb-1 text-gray-600">Raw Response</h4>
        <pre className="bg-black text-white p-4 rounded text-xs overflow-x-auto max-h-[400px]">
          {JSON.stringify(analysisResult, null, 2)}
        </pre>
      </div>
    </div>
  );
};
