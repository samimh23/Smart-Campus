import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://172.28.208.19:3000'

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const authorization = request.headers.get('authorization')
    const { studentId } = params
    
    const response = await fetch(`${BACKEND_URL}/classes/student/${studentId}/subjects`, {
      headers: {
        'Content-Type': 'application/json',
        ...(authorization && { 'Authorization': authorization })
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch student subjects' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student subjects' },
      { status: 503 }
    )
  }
}
