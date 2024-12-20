import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const players = await kv.get('players') || []
  const updatedPlayers = players.filter((player: any) => player.id !== params.id)
  await kv.set('players', updatedPlayers)
  return NextResponse.json(updatedPlayers)
}

