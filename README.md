# ⚡ Hedera GeoGuesser

A breathtaking 3D geography game where your sense of place meets the power of the Hedera blockchain. Journey across immersive 3D world environments, explore real-world locations, and earn HBAR tokens and collectible NFTs for your geographical prowess!

## 🌍 Game Features

### Immersive 3D Exploration
- **Realistic 3D Environments**: Each round drops you into a stunning 3D representation of real-world locations
- **Full Movement Controls**: Explore freely with WASD movement, mouse look, running, and jumping
- **Dynamic Weather & Biomes**: Experience different environments from tropical rainforests to polar ice caps
- **Interactive Landmarks**: Discover iconic structures, natural formations, and cultural sites

### Play-to-Earn Mechanics
- **HBAR Rewards**: Earn real HBAR tokens based on your geographical accuracy and exploration
- **Achievement NFTs**: Unlock collectible NFTs for special accomplishments
- **Performance Bonuses**: Get extra rewards for speed, accuracy, and thorough exploration
- **Leaderboard Competition**: Compete with players worldwide on the Hedera blockchain

### Blockchain Integration
- **Hedera Hashgraph Network**: Secure, fast, and eco-friendly blockchain integration
- **Real-time Scoring**: Transparent scoring system recorded on the blockchain
- **Wallet Integration**: Connect your Hedera wallet to start earning immediately
- **Asset Distribution**: Automatic HBAR and NFT rewards for achievements

## 🎮 How to Play

### Basic Gameplay
1. **Connect Your Wallet**: Link your Hedera wallet to earn rewards
2. **Explore the World**: Use movement controls to investigate your surroundings
3. **Find Clues**: Look for landmarks, architecture, vegetation, and terrain features
4. **Make Your Guess**: Click on the world map to place your location guess
5. **Earn Rewards**: Get HBAR and NFTs based on your accuracy and performance

### Controls
- **WASD**: Move around the 3D environment
- **Mouse**: Look around and explore
- **Shift**: Run faster to cover more ground
- **Space**: Jump to get better views
- **Click Canvas**: Enable first-person mouse look

### Scoring System
- **Distance-based Points**: Closer guesses earn more points (up to 5,000 per round)
- **Speed Bonus**: Quick correct guesses earn bonus multipliers
- **Exploration Bonus**: Thorough exploration of the area adds extra points
- **Perfect Round Bonus**: Maximum points for extremely accurate guesses

## 🔧 Technical Setup

### Prerequisites
- Modern web browser with WebGL support
- Internet connection for blockchain features
- Hedera wallet (optional but recommended for earning rewards)

### Installation & Running

#### Option 1: Simple HTTP Server (Recommended)
```bash
# Clone the repository
git clone https://github.com/souvik0908/Hedera-GeoGuesser.git
cd Hedera-GeoGuesser

# Install dependencies
npm install

# Start development server
npm start
```

#### Option 2: Direct File Access
You can also run the game by directly opening `index.html` in a modern web browser, though some features may be limited without a proper HTTP server.

### Browser Compatibility
- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support with WebGL enabled
- **Mobile**: Responsive design with touch controls

## 🏗️ Architecture

### Core Components

#### Frontend (Client-Side)
- **Three.js**: 3D graphics rendering and world generation
- **HTML5 Canvas**: 2D map interface and UI elements
- **WebGL**: Hardware-accelerated 3D graphics
- **Responsive CSS**: Mobile-friendly interface

#### Blockchain Integration
- **Hedera SDK**: Direct integration with Hedera network
- **Wallet Connection**: HashPack and other Hedera wallet support
- **Smart Contracts**: Automated reward distribution
- **Consensus Service**: Leaderboard and score verification

#### Game Systems
- **World Generator**: Procedural 3D environment creation
- **Player Controller**: First-person movement and interaction
- **Game Logic**: Scoring, rounds, and progression
- **UI Manager**: User interface and blockchain interaction

### File Structure
```
Hedera-GeoGuesser/
├── index.html              # Main game interface
├── package.json            # Project dependencies
├── styles/
│   └── main.css           # Game styling and UI
├── js/
│   ├── config.js          # Game configuration and settings
│   ├── hedera-client.js   # Blockchain integration
│   ├── world-generator.js # 3D world creation
│   ├── player-controller.js # Movement and controls
│   ├── game-logic.js      # Core game mechanics
│   ├── ui-manager.js      # User interface management
│   └── app.js            # Main application controller
└── README.md              # This file
```

## 🌟 Game Locations

The game features 10+ carefully selected real-world locations:

- **🗼 Eiffel Tower, France** - Iconic urban landmark
- **🏔️ Grand Canyon, USA** - Massive desert canyon
- **🏛️ Machu Picchu, Peru** - Ancient mountain ruins
- **🏜️ Sahara Desert, Morocco** - Vast sand dunes
- **🌋 Mount Fuji, Japan** - Sacred volcanic peak
- **🌳 Amazon Rainforest, Brazil** - Dense tropical jungle
- **🏯 Great Wall of China** - Historic mountain fortification
- **💧 Victoria Falls, Zambia** - Powerful waterfall
- **🏛️ Santorini, Greece** - Mediterranean island beauty
- **🐧 Antarctica** - Polar research station

Each location features unique:
- **Biome characteristics** (terrain, vegetation, climate)
- **Cultural landmarks** and architecture
- **Geographical features** and formations
- **Difficulty levels** for varied challenge

## 💰 Rewards & NFTs

### HBAR Rewards
- **Base Reward**: 0.1 HBAR for participation
- **Performance Bonus**: Additional HBAR for high scores
- **Perfect Rounds**: Special bonuses for 100% accuracy
- **Exploration Incentive**: Rewards for thorough area coverage

### Achievement NFTs
- **🎯 Perfect Round**: Score maximum points in a single round
- **⚡ Speed Demon**: Complete round in under 30 seconds
- **🗺️ Explorer**: Play 10 complete games
- **🌍 Geography Master**: Achieve 20,000+ total score
- **🏆 Custom Achievements**: Special limited-time challenges

### Leaderboard System
- **Global Rankings**: Compete with players worldwide
- **Seasonal Competitions**: Regular tournaments with special rewards
- **Achievement Galleries**: Showcase your NFT collections
- **Statistics Tracking**: Detailed performance analytics

## 🔐 Blockchain Security

### Hedera Network Benefits
- **Fast Transactions**: Sub-second confirmation times
- **Low Fees**: Minimal transaction costs
- **Eco-Friendly**: Carbon-negative consensus mechanism
- **Enterprise Security**: Bank-grade security and compliance

### Smart Contract Features
- **Automated Rewards**: Instant HBAR distribution based on performance
- **NFT Minting**: Dynamic achievement NFT creation
- **Leaderboard Integrity**: Tamper-proof score recording
- **Fair Play Verification**: Anti-cheat mechanisms

## 🚀 Roadmap

### Phase 1: Core Game (Current)
- ✅ 3D world generation and exploration
- ✅ Basic gameplay mechanics
- ✅ Hedera wallet integration
- ✅ HBAR reward system
- ✅ Achievement NFTs

### Phase 2: Enhanced Features
- 🔄 Multiplayer competitions
- 🔄 Custom location challenges
- 🔄 Mobile app version
- 🔄 VR/AR support
- 🔄 Community-generated content

### Phase 3: Ecosystem Expansion
- 🔄 Tournament system
- 🔄 Educational partnerships
- 🔄 Geographic learning modules
- 🔄 Creator economy features
- 🔄 Cross-chain integration

## 🤝 Contributing

We welcome contributions to make Hedera GeoGuesser even better!

### Development Guidelines
1. **Fork** the repository
2. **Create** a feature branch
3. **Implement** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### Areas for Contribution
- **New Locations**: Add more real-world locations
- **3D Assets**: Improve visual quality and landmarks  
- **Game Mechanics**: Enhance gameplay features
- **UI/UX**: Improve user experience
- **Blockchain Features**: Expand Hedera integration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Hedera Hashgraph** for the amazing blockchain platform
- **Three.js Community** for the incredible 3D graphics library
- **Geography Enthusiasts** worldwide for inspiration
- **Open Source Community** for continuous support

## 📞 Contact & Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/souvik0908/Hedera-GeoGuesser/issues)
- **Discord Community**: Join our gaming community (coming soon)
- **Email Support**: support@hederageoguesser.com (coming soon)

---

**Ready to explore the world and earn crypto? Start your journey with Hedera GeoGuesser today! 🌍⚡**