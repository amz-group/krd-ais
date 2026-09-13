export default async function(req: Request): Promise<Response> {
  await req.text().catch(() => '');
  return Response.json({ local_only: true, message: 'Speech uses the browser.' });
}
