/**
 * RPC Proxy — avoids CORS issues with direct browser-to-RPC calls.
 *
 * Instead of calling the Kasplex RPC directly from the browser (which is
 * blocked by CORS), the frontend calls /api/rpc, and Next.js forwards the
 * JSON-RPC request from the server side (no CORS restrictions).
 */

const KASPLEX_RPC = 'https://rpc.kasplextest.xyz'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const response = await fetch(KASPLEX_RPC, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    })

    if (!response.ok) {
      return Response.json(
        { error: `RPC responded with status ${response.status}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return Response.json(data)
  } catch (err) {
    console.error('[RPC Proxy] Error:', err)
    return Response.json(
      { error: 'RPC proxy request failed', detail: String(err) },
      { status: 500 },
    )
  }
}
