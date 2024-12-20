import GameTracker from '@/components/GameTracker'

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Game Tracker</h1>
      <GameTracker />
    </main>
  )
}

