import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export async function GET() {
  const players = await kv.get('players') || []
  return NextResponse.json(players)
}

export async function POST(request: Request) {
  const newPlayer = await request.json()
  const players = await kv.get('players') || []
  const updatedPlayers = [...players, newPlayer]
  await kv.set('players', updatedPlayers)
  return NextResponse.json(updatedPlayers)
}

