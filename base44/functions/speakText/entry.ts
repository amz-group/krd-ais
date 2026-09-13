import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const text = (body && body.text) || '';
    if (typeof text !== 'string' || text.length === 0 || text.length > 500) {
      return Response.json({ error: 'invalid_text' }, { status: 400 });
    }

    const result = await base44.asServiceRole.integrations.Core.GenerateSpeech({
      text
    });

    return Response.json({ url: result.url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}