import { NextResponse } from 'next/server'

export async function GET() {
  console.log('[Test] API route called')
  return NextResponse.json({ ok: true, message: 'API route is working' })
}

export async function POST() {
  console.log('[Test] POST API route called')

  try {
    const testData = {
      timestamp: new Date().toISOString(),
      message: 'POST working',
    }

    console.log('[Test] Returning data:', testData)
    return NextResponse.json({ ok: true, data: testData })
  } catch (error: any) {
    console.error('[Test] Error:', error)
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    )
  }
}
