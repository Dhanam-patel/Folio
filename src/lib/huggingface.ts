export async function callHuggingFace(
  apiKey: string,
  model: string,
  prompt: string
): Promise<string> {
  if (!apiKey || !model) {
    throw new Error('HuggingFace API key and model are required');
  }

  const url = `https://api-inference.huggingface.co/models/${model}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 2048,
          temperature: 0.3,
          return_full_text: false,
          do_sample: true,
        },
      }),
    });

    if (!res.ok) {
      let errorMessage = `HuggingFace API error: ${res.status}`;
      try {
        const err = await res.json();
        // Handle loading state
        if (err?.error?.includes('loading')) {
          throw new Error(`Model ${model} is loading. Please wait 1-2 minutes and try again.`);
        }
        errorMessage = err?.error || err?.message || errorMessage;
      } catch {
        // ignore JSON parse errors
      }
      throw new Error(errorMessage);
    }

    const data = await res.json();

    // Handle different response formats
    let text = '';
    if (Array.isArray(data)) {
      text = data[0]?.generated_text || data[0]?.text || '';
    } else if (typeof data === 'string') {
      text = data;
    } else {
      text = data?.generated_text || data?.text || '';
    }

    if (!text) {
      console.error('HuggingFace response:', JSON.stringify(data, null, 2));
      throw new Error('Empty response from HuggingFace');
    }

    return text;
  } catch (e) {
    if (e instanceof Error) {
      throw e;
    }
    throw new Error('Failed to call HuggingFace API');
  }
}

export async function validateHuggingFaceKey(apiKey: string, model: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const result = await callHuggingFace(apiKey, model, 'Respond with just the word "ok".');
    return { valid: result.toLowerCase().includes('ok') || result.length > 0 };
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'Validation failed';
    console.error('HuggingFace validation failed:', errorMsg);
    return { valid: false, error: errorMsg };
  }
}
