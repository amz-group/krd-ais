import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { image_data, file_url, media_type } = body || {};

    const modelUrl = secrets.get('AI_MODEL_URL');
    if (!modelUrl) {
      return Response.json({ connected: false, message: 'AI Model Not Connected' });
    }

    if (!image_data && !file_url) {
      return Response.json({ connected: true, error: 'no_input' }, { status: 400 });
    }

    const apiKey = secrets.get('AI_MODEL_API_KEY');
    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

    const res = await fetch(modelUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        image: image_data || null,
        file_url: file_url || null,
        media_type: media_type || (image_data ? 'image' : 'file')
      })
    });

    if (!res.ok) {
      return Response.json({ connected: true, error: `model_http_${res.status}` });
    }

    const data = await res.json().catch(() => ({}));
    const prediction = data.prediction ?? data.label ?? data.word ?? null;
    const confidence = typeof data.confidence === 'number' ? data.confidence : null;

    if (!prediction) {
      return Response.json({ connected: true, error: 'invalid_response' });
    }

    return Response.json({ connected: true, prediction, confidence });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}