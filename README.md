# Neon Drift

An addictive endless runner game with neon-styled graphics. Jump over obstacles, rack up points, and beat your high score!

## Features

- 🎮 Endless runner gameplay
- 🚀 One-button jump controls (SPACE or UP arrow)
- ⚡ Dynamic obstacle generation
- 🏆 High score system with localStorage persistence
- 📈 Progressive difficulty
- ✨ Neon particle effects
- 🎨 Colorful gradient obstacles
- 💀 Instant game over and restart

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Development

The project uses Vite for fast development and hot module replacement. Run `npm run dev` and open http://localhost:5173 to see your game.

## Project Structure

```
premium-web-game/
├── src/
│   ├── main.js              # Entry point
│   ├── remix_sdk.js         # Remix.gg SDK stub
│   ├── scenes/
│   │   ├── BootScene.js     # Loading scene
│   │   └── PlayScene.js     # Main game scene
│   └── premium/
│       └── purchase.js      # Purchase flow wrapper
├── index.html
├── vite.config.js
└── package.json
```

## Premium Features

- Exclusive particle effects
- Enhanced visuals
- Special player appearance

## Deployment to Remix.gg

1. Build the project: `npm run build`
2. Compress the `dist/` folder to a zip file
3. Upload to Remix.gg marketplace
4. Follow Remix.gg's publishing guidelines

## License

ISC
