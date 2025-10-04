"use client"

import { TetrisGame } from "@/components/tetris-game"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4">
      <TetrisGame />
    </main>
  )
}
