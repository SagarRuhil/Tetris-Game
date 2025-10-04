"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw } from "lucide-react"

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const BLOCK_SIZE = 30

type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L"
type Board = (TetrominoType | null)[][]
type Position = { x: number; y: number }

const TETROMINOS: Record<TetrominoType, number[][]> = {
  I: [[1, 1, 1, 1]],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
  ],
}

const COLORS: Record<TetrominoType, string> = {
  I: "bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-[0_0_10px_rgba(34,211,238,0.5)]",
  O: "bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-[0_0_10px_rgba(250,204,21,0.5)]",
  T: "bg-gradient-to-br from-purple-400 to-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.5)]",
  S: "bg-gradient-to-br from-green-400 to-green-600 shadow-[0_0_10px_rgba(34,197,94,0.5)]",
  Z: "bg-gradient-to-br from-red-400 to-red-600 shadow-[0_0_10px_rgba(239,68,68,0.5)]",
  J: "bg-gradient-to-br from-blue-400 to-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.5)]",
  L: "bg-gradient-to-br from-orange-400 to-orange-600 shadow-[0_0_10px_rgba(251,146,60,0.5)]",
}

const createEmptyBoard = (): Board => Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null))

const getRandomTetromino = (): TetrominoType => {
  const types: TetrominoType[] = ["I", "O", "T", "S", "Z", "J", "L"]
  return types[Math.floor(Math.random() * types.length)]
}

export function TetrisGame() {
  const [board, setBoard] = useState<Board>(createEmptyBoard())
  const [currentPiece, setCurrentPiece] = useState<TetrominoType>(getRandomTetromino())
  const [currentPosition, setCurrentPosition] = useState<Position>({ x: 4, y: 0 })
  const [currentRotation, setCurrentRotation] = useState(0)
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [time, setTime] = useState(0)
  const [nextPiece, setNextPiece] = useState<TetrominoType>(getRandomTetromino())
  const [isSoftDropping, setIsSoftDropping] = useState(false)
  const gameLoopRef = useRef<NodeJS.Timeout>()
  const timerRef = useRef<NodeJS.Timeout>()
  const softDropRef = useRef<NodeJS.Timeout>()

  const rotatePiece = (piece: number[][]): number[][] => {
    return piece[0].map((_, i) => piece.map((row) => row[i]).reverse())
  }

  const getCurrentShape = useCallback(() => {
    let shape = TETROMINOS[currentPiece]
    for (let i = 0; i < currentRotation; i++) {
      shape = rotatePiece(shape)
    }
    return shape
  }, [currentPiece, currentRotation])

  const isValidMove = useCallback(
    (shape: number[][], pos: Position, testBoard: Board = board): boolean => {
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const newX = pos.x + x
            const newY = pos.y + y

            if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
              return false
            }

            if (newY >= 0 && testBoard[newY][newX]) {
              return false
            }
          }
        }
      }
      return true
    },
    [board],
  )

  const mergePieceToBoard = useCallback(() => {
    const newBoard = board.map((row) => [...row])
    const shape = getCurrentShape()

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] && currentPosition.y + y >= 0) {
          newBoard[currentPosition.y + y][currentPosition.x + x] = currentPiece
        }
      }
    }

    return newBoard
  }, [board, currentPiece, currentPosition, getCurrentShape])

  const clearLines = useCallback(
    (boardToClear: Board) => {
      let linesCleared = 0
      const newBoard = boardToClear.filter((row) => {
        if (row.every((cell) => cell !== null)) {
          linesCleared++
          return false
        }
        return true
      })

      while (newBoard.length < BOARD_HEIGHT) {
        newBoard.unshift(Array(BOARD_WIDTH).fill(null))
      }

      if (linesCleared > 0) {
        const points = [0, 100, 300, 500, 800][linesCleared] * level
        setScore((prev) => prev + points)
        setLines((prev) => {
          const newLines = prev + linesCleared
          setLevel(Math.floor(newLines / 10) + 1)
          return newLines
        })
      }

      return newBoard
    },
    [level],
  )

  const spawnNewPiece = useCallback(() => {
    const newPiece = nextPiece
    const newNext = getRandomTetromino()
    const startPos = { x: 4, y: 0 }

    if (!isValidMove(TETROMINOS[newPiece], startPos, board)) {
      setGameOver(true)
      return
    }

    setCurrentPiece(newPiece)
    setNextPiece(newNext)
    setCurrentPosition(startPos)
    setCurrentRotation(0)
  }, [board, isValidMove, nextPiece])

  const moveDown = useCallback(() => {
    if (gameOver || isPaused) return

    const shape = getCurrentShape()
    const newPos = { x: currentPosition.x, y: currentPosition.y + 1 }

    if (isValidMove(shape, newPos)) {
      setCurrentPosition(newPos)
    } else {
      const mergedBoard = mergePieceToBoard()
      const clearedBoard = clearLines(mergedBoard)
      setBoard(clearedBoard)
      spawnNewPiece()
    }
  }, [gameOver, isPaused, getCurrentShape, currentPosition, isValidMove, mergePieceToBoard, clearLines, spawnNewPiece])

  const moveHorizontal = useCallback(
    (direction: number) => {
      if (gameOver || isPaused) return

      const shape = getCurrentShape()
      const newPos = { x: currentPosition.x + direction, y: currentPosition.y }

      if (isValidMove(shape, newPos)) {
        setCurrentPosition(newPos)
      }
    },
    [gameOver, isPaused, getCurrentShape, currentPosition, isValidMove],
  )

  const rotate = useCallback(() => {
    if (gameOver || isPaused) return

    const newRotation = (currentRotation + 1) % 4
    let shape = TETROMINOS[currentPiece]
    for (let i = 0; i < newRotation; i++) {
      shape = rotatePiece(shape)
    }

    if (isValidMove(shape, currentPosition)) {
      setCurrentRotation(newRotation)
    }
  }, [gameOver, isPaused, currentPiece, currentRotation, currentPosition, isValidMove])

  const hardDrop = useCallback(() => {
    if (gameOver || isPaused) return

    const shape = getCurrentShape()
    let newY = currentPosition.y

    while (isValidMove(shape, { x: currentPosition.x, y: newY + 1 })) {
      newY++
    }

    setCurrentPosition({ x: currentPosition.x, y: newY })
    setTimeout(moveDown, 50)
  }, [gameOver, isPaused, getCurrentShape, currentPosition, isValidMove, moveDown])

  const resetGame = () => {
    setBoard(createEmptyBoard())
    setCurrentPiece(getRandomTetromino())
    setNextPiece(getRandomTetromino())
    setCurrentPosition({ x: 4, y: 0 })
    setCurrentRotation(0)
    setScore(0)
    setLines(0)
    setLevel(1)
    setGameOver(false)
    setIsPaused(false)
    setTime(0)
    setIsSoftDropping(false)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return

      const key = e.key.toLowerCase()

      switch (key) {
        case "a":
          e.preventDefault()
          moveHorizontal(-1)
          break
        case "d":
          e.preventDefault()
          moveHorizontal(1)
          break
        case "s":
          e.preventDefault()
          setIsSoftDropping(true)
          break
        case "w":
          e.preventDefault()
          rotate()
          break
        case "p":
          e.preventDefault()
          setIsPaused((prev) => !prev)
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key === "s") {
        setIsSoftDropping(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [gameOver, moveHorizontal, rotate])

  useEffect(() => {
    if (!gameOver && !isPaused) {
      const baseSpeed = Math.max(100, 800 - (level - 1) * 80)
      gameLoopRef.current = setInterval(moveDown, baseSpeed)

      return () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current)
      }
    }
  }, [gameOver, isPaused, level, moveDown])

  useEffect(() => {
    if (!gameOver && !isPaused && isSoftDropping) {
      softDropRef.current = setInterval(moveDown, 50)

      return () => {
        if (softDropRef.current) clearInterval(softDropRef.current)
      }
    }
  }, [gameOver, isPaused, isSoftDropping, moveDown])

  const renderBoard = () => {
    const displayBoard = board.map((row) => [...row])
    const shape = getCurrentShape()

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] && currentPosition.y + y >= 0) {
          displayBoard[currentPosition.y + y][currentPosition.x + x] = currentPiece
        }
      }
    }

    return displayBoard.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={`${y}-${x}`}
            className={`border border-border/20 transition-all duration-100 ease-linear rounded-sm ${
              cell ? `${COLORS[cell]}` : "bg-slate-900/40"
            }`}
            style={{
              width: `${BLOCK_SIZE}px`,
              height: `${BLOCK_SIZE}px`,
            }}
          />
        ))}
      </div>
    ))
  }

  const renderNextPiece = () => {
    const shape = TETROMINOS[nextPiece]
    return (
      <div className="flex flex-col items-center gap-1">
        {shape.map((row, y) => (
          <div key={y} className="flex gap-1">
            {row.map((cell, x) => (
              <div
                key={`${y}-${x}`}
                className={`w-6 h-6 rounded-md transition-all ${cell ? `${COLORS[nextPiece]}` : "bg-transparent"}`}
              />
            ))}
          </div>
        ))}
      </div>
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      <Card className="p-6 bg-gradient-to-br from-slate-950 to-slate-900 backdrop-blur-sm border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20">
        <div className="relative rounded-lg overflow-hidden">
          {renderBoard()}
          {gameOver && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                  Game Over!
                </h2>
                <p className="text-xl text-white">Final Score: {score}</p>
                <Button onClick={resetGame} size="lg" className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500">
                  <RotateCcw className="w-5 h-5" />
                  Play Again
                </Button>
              </div>
            </div>
          )}
          {isPaused && !gameOver && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Paused
                </h2>
                <p className="text-white">Press P to continue</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="flex flex-col gap-4 w-full lg:w-64">
        <Card className="p-6 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-2 border-purple-500/50 shadow-xl shadow-purple-500/20">
          <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Next Piece
          </h3>
          <div className="flex justify-center p-4 bg-slate-900/50 rounded-lg">{renderNextPiece()}</div>
        </Card>

        <Card className="p-6 bg-slate-950/95 border-2 border-cyan-500/50 shadow-xl shadow-cyan-500/20 space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-900/90 rounded-lg border border-cyan-500/20">
              <span className="text-sm font-medium text-cyan-300">Score</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {score}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900/90 rounded-lg border border-green-500/20">
              <span className="text-sm font-medium text-green-300">Lines</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {lines}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900/90 rounded-lg border border-orange-500/20">
              <span className="text-sm font-medium text-orange-300">Level</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                {level}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-cyan-500/30">
            <div className="flex justify-between items-center p-3 bg-slate-900/90 rounded-lg border border-purple-500/20">
              <span className="text-sm font-medium text-purple-300">Time</span>
              <span className="text-2xl font-bold font-mono bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {formatTime(time)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700 shadow-xl space-y-3">
          <Button
            onClick={() => setIsPaused(!isPaused)}
            disabled={gameOver}
            className="w-full gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            variant={isPaused ? "default" : "secondary"}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? "Resume" : "Pause"}
          </Button>
          <Button
            onClick={resetGame}
            variant="outline"
            className="w-full gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/50 hover:from-orange-500/30 hover:to-red-500/30"
          >
            <RotateCcw className="w-4 h-4" />
            New Game
          </Button>
        </Card>

        <Card className="p-4 bg-slate-950/95 border-2 border-indigo-500/50 shadow-lg">
          <h3 className="text-sm font-bold mb-3 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Controls
          </h3>
          <div className="text-xs space-y-2">
            <p className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-slate-900/90 rounded text-cyan-400 font-bold border border-cyan-500/50">
                A
              </kbd>
              <span className="text-slate-200">Move Left</span>
            </p>
            <p className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-slate-900/90 rounded text-cyan-400 font-bold border border-cyan-500/50">
                D
              </kbd>
              <span className="text-slate-200">Move Right</span>
            </p>
            <p className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-slate-900/90 rounded text-green-400 font-bold border border-green-500/50">
                S
              </kbd>
              <span className="text-slate-200">Speed Drop</span>
            </p>
            <p className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-slate-900/90 rounded text-purple-400 font-bold border border-purple-500/50">
                W
              </kbd>
              <span className="text-slate-200">Rotate</span>
            </p>
            <p className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-slate-900/90 rounded text-orange-400 font-bold border border-orange-500/50">
                P
              </kbd>
              <span className="text-slate-200">Pause</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
