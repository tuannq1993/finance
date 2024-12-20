'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Player {
  id: string
  name: string
}

interface GameData {
  id: string
  date: string
  participants: string[]
  amount: number
}

export default function GameTracker() {
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'Đôn Thắng' },
    { id: '2', name: 'Vĩnh Long' },
    { id: '3', name: 'Vũ' },
    { id: '4', name: 'Dung' },
    { id: '5', name: 'Tuấn' },
    { id: '6', name: 'Hiếu' },
    { id: '7', name: 'Bắc' },
    { id: '8', name: 'Nhật' },
  ])
  const [gameData, setGameData] = useState<GameData[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [amount, setAmount] = useState<string>('')

  useEffect(() => {
    fetchGameData()
  }, [])

  const fetchGameData = async () => {
    const response = await fetch('/api/game-data')
    if (response.ok) {
      const data = await response.json()
      setGameData(data)
    }
  }

  const handleAddGame = async () => {
    if (!selectedDate || selectedPlayers.length === 0 || !amount) return

    const newGame: GameData = {
      id: Date.now().toString(), // Use timestamp as a simple unique ID
      date: format(selectedDate, 'yyyy-MM-dd'),
      participants: selectedPlayers,
      amount: parseFloat(amount),
    }

    const response = await fetch('/api/game-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGame),
    })

    if (response.ok) {
      setGameData([...gameData, newGame])
      setSelectedPlayers([])
      setAmount('')
    }
  }

  const handleAddPlayer = async () => {
    const newId = `A${players.length + 1}`
    const newPlayer = { id: newId, name: newId }
    
    const response = await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPlayer),
    })

    if (response.ok) {
      setPlayers([...players, newPlayer])
    }
  }

  const handleRemovePlayer = async (id: string) => {
    const response = await fetch(`/api/players/${id}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      setPlayers(players.filter(player => player.id !== id))
      setGameData(gameData.map(game => ({
        ...game,
        participants: game.participants.filter(p => p !== id)
      })))
    }
  }

  const calculateTotals = () => {
    const totals: { [key: string]: number } = {}
    gameData.forEach(game => {
      const individualAmount = game.amount / game.participants.length
      game.participants.forEach(participant => {
        totals[participant] = (totals[participant] || 0) + individualAmount
      })
    })
    return totals
  }


  const totals = calculateTotals()

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <div className="flex flex-col space-y-2">
          <Label>Select Players:</Label>
          {players.map((player) => (
            <div key={player.id} className="flex items-center space-x-2">
              <Checkbox
                id={player.id}
                checked={selectedPlayers.includes(player.id)}
                onCheckedChange={(checked) => {
                  setSelectedPlayers(
                    checked
                      ? [...selectedPlayers, player.id]
                      : selectedPlayers.filter((id) => id !== player.id)
                  )
                }}
              />
              <label
                htmlFor={player.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {player.name}
              </label>
            </div>
          ))}
        </div>
        <Input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-[200px]"
        />
        <Button onClick={handleAddGame}>Add Game</Button>
      </div>
      <div className="flex space-x-4">
        <Button onClick={handleAddPlayer}>Add Player</Button>
      </div>
      <table className="w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Total Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {players.map(player => (
            <tr key={player.id}>
              <td>{player.name}</td>
              <td>{totals[player.id]?.toLocaleString('vi-VN')} ₫</td>
              <td>
                <Button onClick={() => handleRemovePlayer(player.id)} variant="destructive">
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <table className="w-full">
        <thead>
          <tr>
            <th>Date</th>
            <th>Game</th>
            <th>Participants</th>
            <th>Amount</th>
            <th>Individual Amount</th>
          </tr>
        </thead>
        <tbody>
          {gameData.map((game) => (
            <tr key={game.id}>
              <td>{game.date}</td>
              <td>{game.id}</td>
              <td>{game.participants.map(id => players.find(p => p.id === id)?.name).join(', ')}</td>
              <td>{game.amount.toLocaleString('vi-VN')} ₫</td>
              <td>{(game.amount / game.participants.length).toLocaleString('vi-VN')} ₫</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

