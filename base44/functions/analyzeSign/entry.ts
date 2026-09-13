export default async function(req: Request): Promise<Response> {
  await req.text().catch(() => '');
  return Response.json({
    connected: false,
    local_only: true,
    message: 'Recognition runs locally in the browser; no API key is required.'
  });
}
