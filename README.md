Visit https://letsplaytetris.vercel.app/ to Play

# Creative Tetris Game

A fully functional, colorful Tetris game built with Next.js, React, and TypeScript. Features vibrant gradient blocks with glowing effects, smooth animations, and an engaging dark gaming aesthetic.

## Features

- **Classic Tetris Gameplay**: All 7 standard Tetromino pieces (I, O, T, S, Z, J, L)
- **Colorful Design**: Each block type has unique gradient colors with glowing shadow effects
- **Smooth Controls**: Responsive keyboard controls with smooth piece movement
- **Progressive Difficulty**: Game speed increases as you level up
- **Score System**: Points awarded for clearing lines (more lines = more points)
- **Live Statistics**: Real-time tracking of score, lines cleared, level, and play time
- **Next Piece Preview**: See what's coming next to plan your strategy
- **Pause/Resume**: Take a break anytime with the pause feature

## Controls

| Key | Action |
|-----|--------|
| **A** | Move piece left |
| **D** | Move piece right |
| **S** | Speed drop (hold for fast falling) |
| **W** | Rotate piece clockwise |
| **P** | Pause/Resume game |

## How to Play

1. Pieces fall from the top of the board
2. Use **A** and **D** to position pieces horizontally
3. Press **W** to rotate pieces
4. Hold **S** to make pieces fall faster
5. Complete horizontal lines to clear them and score points
6. Game ends when pieces stack to the top

## Scoring

- **1 Line**: 100 points × level
- **2 Lines**: 300 points × level
- **3 Lines**: 500 points × level
- **4 Lines (Tetris)**: 800 points × level

## Level Progression

- Level increases every 10 lines cleared
- Higher levels = faster falling speed
- Maximum challenge at higher levels!

## Technologies Used

- **Next.js 15** - React framework with App Router
- **React 19** - UI library with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - Beautiful UI components

## Installation

This project uses the Next.js App Router and can be installed using:

\`\`\`bash
# Using shadcn CLI (recommended)
npx shadcn@latest init

# Or download and install manually
npm install
npm run dev
\`\`\`

## Game Mechanics

- **Board Size**: 10 columns × 20 rows
- **Block Size**: 30px × 30px
- **Starting Speed**: 800ms per drop
- **Speed Increase**: 80ms faster per level
- **Minimum Speed**: 100ms per drop
- **Soft Drop Speed**: 50ms per drop (when holding S)

## Color Palette

Each Tetromino has a unique color scheme:

- **I-Piece**: Cyan gradient with glow
- **O-Piece**: Yellow gradient with glow
- **T-Piece**: Purple gradient with glow
- **S-Piece**: Green gradient with glow
- **Z-Piece**: Red gradient with glow
- **J-Piece**: Blue gradient with glow
- **L-Piece**: Orange gradient with glow

## Development

The game is built with modern React patterns:

- Functional components with hooks
- Custom game loop with `useEffect` and `setInterval`
- Immutable state management
- Collision detection system
- Line clearing algorithm
- Piece rotation matrix transformation

## Credits

Created with ❤️ using v0 by Vercel

Enjoy playing! 🎮
