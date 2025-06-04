# Tetris 3D Game

## Overview
This project is a 3D implementation of the classic Tetris game. It features standard Tetris gameplay mechanics, including the ability to hold one block, a preview of the next block, and a scoring system. The game is built using JavaScript and utilizes Three.js for rendering 3D graphics.

## Features
- **3D Graphics**: Experience Tetris in a new dimension with 3D-rendered blocks and game board.
- **Next Block Preview**: See the next tetromino that will appear, allowing for strategic gameplay.
- **Hold Block Feature**: Players can hold one block and swap it with the current block.
- **Scoring System**: Track your score based on the number of lines cleared.

## Project Structure
```
tetris-3d-game
├── src
│   ├── index.js          # Entry point of the game
│   ├── game
│   │   ├── tetris.js     # Game logic and state management
│   │   ├── board.js      # Game board management
│   │   ├── block.js      # Tetris block definitions
│   │   ├── score.js      # Scoring system
│   │   └── hold.js       # Hold block functionality
│   ├── graphics
│   │   ├── renderer.js    # 3D rendering logic
│   │   └── threejs-setup.js # Three.js environment setup
│   ├── ui
│   │   ├── controls.js    # User input handling
│   │   ├── preview.js     # Next block preview management
│   │   └── hud.js         # Heads-up display management
│   └── utils
│       └── helpers.js     # Utility functions
├── public
│   ├── index.html         # Main HTML file
│   └── styles.css         # Game styles
├── package.json           # npm configuration
└── README.md              # Project documentation
```

## Getting Started
1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd tetris-3d-game
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Run the game**:
   ```
   npm start
   ```

4. **Open your browser** and navigate to `http://localhost:3000` to play the game.

## Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License. See the LICENSE file for details.