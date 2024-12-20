import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export async function GET() {
  const gameData = await kv.get('gameData') || []
  return NextResponse.json(gameData)
}

export async function POST(request: Request) {
  const newGame = await request.json()
  const gameData = await kv.get('gameData') || []
  const updatedGameData = [...gameData, newGame]
  await kv.set('gameData', updatedGameData)
  return NextResponse.json(updatedGameData)
}

