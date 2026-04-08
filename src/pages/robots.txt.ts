export async function GET() {
  const body = `User-agent: *
Allow: /

Sitemap: https://simuladorcredito.lat/sitemap-index.xml
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
