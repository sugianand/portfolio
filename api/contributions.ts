// Vercel function: the contribution calendar, served from this site's own origin.
// Visitors' privacy and ad blockers often block the third-party API outright, so
// the page asks here first; the CDN caches the answer for an hour.
const USER = 'sugianand'

export async function GET() {
  try {
    const upstream = await fetch(`https://github-contributions-api.jogruber.de/v4/${USER}?y=last`)
    if (!upstream.ok) return new Response('upstream error', { status: 502 })
    return new Response(await upstream.text(), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch {
    return new Response('upstream unreachable', { status: 502 })
  }
}
