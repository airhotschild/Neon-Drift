# Neon Drift

An addictive neon-styled physics game built with Phaser 3 and Vite, featuring premium in-game purchases through Remix.gg integration.

## Features

- 🎮 Interactive gameplay with Phaser 3
- 💎 Premium purchase system
- 🚀 Fast development with Vite
- ✨ Particle effects and animations
- 📱 Responsive design

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
