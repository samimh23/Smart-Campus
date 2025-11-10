import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://172.28.208.19:3000'

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')
    
    const response = await fetch(`${BACKEND_URL}/courses`, {
      headers: {
        'Content-Type': 'application/json',
        ...(authorization && { 'Authorization': authorization })
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch courses' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 503 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')
    const body = await request.json()
    
    const response = await fetch(`${BACKEND_URL}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization && { 'Authorization': authorization })
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to create course' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 503 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    const response = await fetch(`${BACKEND_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization && { 'Authorization': authorization })
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to delete course' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 503 }
    )
  }
}
