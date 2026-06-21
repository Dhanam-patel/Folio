export async function callGemini(
  apiKey: string,
  model: string,
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  if (!apiKey || !model) {
    throw new Error('Gemini API key and model are required');
  }

  // Use v1beta for newer models, which supports gemini-2.0 and experimental models
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    ...(systemInstruction
      ? { systemInstruction: { parts: [{ text: systemInstruction }] } }
      : {}),
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 4096,
    },
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let errorMessage = `Gemini API error: ${res.status}`;
      let errorCode = '';
      try {
        const err = await res.json();
        errorMessage = err?.error?.message || errorMessage;
        errorCode = err?.error?.status || '';
      } catch {
        // ignore JSON parse errors
      }
      // Include helpful context for common errors
      if (res.status === 404 || errorMessage.includes('not found') || errorMessage.includes('NOT_FOUND')) {
        throw new Error(`Model "${model}" not found. Check the model name at https://ai.google.dev/gemini-api/docs/models`);
      }
      if (res.status === 400 && errorMessage.includes('API_KEY')) {
        throw new Error('Invalid API key. Get a new key at https://aistudio.google.com/apikey');
      }
      if (errorCode === 'INVALID_ARGUMENT') {
        throw new Error(`Invalid model name "${model}". Verify at https://ai.google.dev/gemini-api/docs/models`);
      }
      throw new Error(errorMessage);
    }

    const data = await res.json();

    // Handle different response formats
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      // Check for finish reasons that indicate issues
      const finishReason = data?.candidates?.[0]?.finishReason;
      if (finishReason === 'SAFETY') {
        throw new Error('Response blocked by safety filters. Try a different prompt.');
      }
      console.error('Gemini response:', JSON.stringify(data, null, 2));
      throw new Error('Empty response from Gemini');
    }

    return text;
  } catch (e) {
    if (e instanceof Error) {
      throw e;
    }
    throw new Error('Failed to call Gemini API');
  }
}

export async function validateGeminiKey(apiKey: string, model: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const result = await callGemini(apiKey, model, 'Respond with just the word "ok".');
    return { valid: result.toLowerCase().includes('ok') || result.length > 0 };
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'Validation failed';
    console.error('Gemini validation failed:', errorMsg);
    return { valid: false, error: errorMsg };
  }
}

// List of known working Gemini models (as of 2024)
export const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
  'gemini-1.5-pro-latest',
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
  'gemini-2.0-flash-lite',
  'gemini-2.0-pro-exp-02-05',
  'gemini-exp-1206',
  'gemini-2.5-pro-preview-05-06',
  'gemini-2.5-flash-preview-05-20',
];
