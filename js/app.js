// Main Application Controller
class HederaGeoGuesserApp {
    constructor() {
        // Core components
        this.hederaClient = null;
        this.worldGenerator = null;
        this.playerController = null;
        this.gameLogic = null;
        this.uiManager = null;
        
        // Loading state
        this.loadingSteps = [
            'Initializing Hedera client...',
            'Loading 3D engine...',
            'Generating world textures...',
            'Setting up player controls...',
            'Loading game logic...',
            'Preparing UI components...',
            'Connecting to blockchain...',
            'Ready to play!'
        ];
        this.currentLoadingStep = 0;
        
        this.init();
    }

    async init() {
        console.log('Initializing Hedera GeoGuesser...');
        
        // Start loading sequence
        await this.startLoadingSequence();
        
        // Initialize components
        await this.initializeComponents();
        
        // Setup game loop
        this.startGameLoop();
        
        // Hide loading and show game
        this.showGame();
        
        console.log('Hedera GeoGuesser initialized successfully!');
    }

    async startLoadingSequence() {
        const loadingProgress = document.getElementById('loading-progress');
        const loadingText = document.querySelector('#loading-screen p');
        
        for (let i = 0; i < this.loadingSteps.length; i++) {
            loadingText.textContent = this.loadingSteps[i];
            loadingProgress.style.width = ((i + 1) / this.loadingSteps.length) * 100 + '%';
            
            // Simulate loading time for each step
            await this.delay(300 + Math.random() * 500);
        }
    }

    async initializeComponents() {
        try {
            // Initialize Hedera client
            this.hederaClient = new HederaClient();
            await this.hederaClient.initialize();
            
            // Initialize 3D world
            const canvas = document.getElementById('game-canvas');
            this.worldGenerator = new WorldGenerator(canvas);
            
            // Initialize player controller
            this.playerController = new PlayerController(
                this.worldGenerator.getCamera(), 
                this.worldGenerator, 
                canvas
            );
            
            // Make player controller globally accessible for UI
            window.playerController = this.playerController;
            
            // Initialize game logic
            this.gameLogic = new GameLogic(this.worldGenerator, this.hederaClient);
            
            // Initialize UI manager
            this.uiManager = new UIManager(this.gameLogic, this.hederaClient);
            
        } catch (error) {
            console.error('Failed to initialize components:', error);
            this.showError('Failed to initialize game components. Please refresh the page.');
        }
    }

    startGameLoop() {
        let lastTime = performance.now();
        
        const gameLoop = (currentTime) => {
            requestAnimationFrame(gameLoop);
            
            const deltaTime = (currentTime - lastTime) / 1000;
            lastTime = currentTime;
            
            // Update player movement and UI
            this.update(deltaTime);
            
            // Render 3D world
            this.render();
        };
        
        gameLoop(performance.now());
        console.log('Game loop started');
    }

    update(deltaTime) {
        // Update distance traveled in UI
        if (this.playerController && this.uiManager) {
            const distance = this.playerController.getDistanceTraveled();
            this.uiManager.updateDistanceTraveled(distance);
        }
    }

    render() {
        // Render 3D world
        if (this.worldGenerator) {
            this.worldGenerator.render();
        }
    }

    showGame() {
        const loadingScreen = document.getElementById('loading-screen');
        const gameContainer = document.getElementById('game-container');
        
        loadingScreen.style.display = 'none';
        gameContainer.style.display = 'block';
        
        // Enable player controls
        if (this.playerController) {
            this.playerController.enable();
        }
        
        // Start UI updates
        if (this.uiManager) {
            this.uiManager.startUIUpdates();
        }
        
        // Show welcome message and start first game
        this.showWelcomeMessage();
    }

    showWelcomeMessage() {
        // Create welcome overlay
        const welcomeOverlay = document.createElement('div');
        welcomeOverlay.className = 'welcome-overlay';
        welcomeOverlay.innerHTML = `
            <div class="welcome-content">
                <h1>⚡ Welcome to Hedera GeoGuesser!</h1>
                <div class="welcome-info">
                    <p>🌍 Explore breathtaking 3D worlds</p>
                    <p>🎯 Guess your location on Earth</p>
                    <p>💰 Earn HBAR and collectible NFTs</p>
                    <p>⚡ Powered by Hedera blockchain</p>
                </div>
                <div class="welcome-controls">
                    <h3>Controls:</h3>
                    <div class="controls-list">
                        <span>🎮 WASD: Move around</span>
                        <span>🖱️ Mouse: Look around</span>
                        <span>⚡ Shift: Run faster</span>
                        <span>🚀 Space: Jump</span>
                    </div>
                </div>
                <button id="start-game-btn" class="start-game-btn">Start Playing!</button>
                <p class="tip">💡 Tip: Connect your wallet to earn HBAR rewards and NFTs!</p>
            </div>
        `;
        
        // Add styles
        welcomeOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 15, 35, 0.95);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            backdrop-filter: blur(10px);
        `;
        
        document.body.appendChild(welcomeOverlay);
        
        // Add event listener to start button
        document.getElementById('start-game-btn').addEventListener('click', () => {
            document.body.removeChild(welcomeOverlay);
            this.startNewGame();
        });
    }

    startNewGame() {
        if (this.gameLogic) {
            this.gameLogic.startGame();
            console.log('New game started!');
        }
    }

    showError(message) {
        const errorOverlay = document.createElement('div');
        errorOverlay.innerHTML = `
            <div style="text-align: center; color: #ff4444;">
                <h2>⚠️ Error</h2>
                <p>${message}</p>
                <button onclick="window.location.reload()">Reload Page</button>
            </div>
        `;
        errorOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 15, 35, 0.95);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;
        document.body.appendChild(errorOverlay);
    }

    // Utility function for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Handle window events
    handleResize() {
        if (this.worldGenerator) {
            this.worldGenerator.handleResize();
        }
    }

    // Cleanup function
    cleanup() {
        if (this.playerController) {
            this.playerController.disable();
        }
        
        if (this.gameLogic) {
            this.gameLogic.stopRoundTimer();
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Starting Hedera GeoGuesser application...');
    
    // Check for required dependencies
    if (typeof THREE === 'undefined') {
        console.error('Three.js not loaded');
        alert('Failed to load 3D graphics library. Please refresh the page.');
        return;
    }
    
    // Initialize the app
    window.hederaGeoGuesser = new HederaGeoGuesserApp();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.hederaGeoGuesser) {
            window.hederaGeoGuesser.handleResize();
        }
    });
    
    // Handle page unload
    window.addEventListener('beforeunload', () => {
        if (window.hederaGeoGuesser) {
            window.hederaGeoGuesser.cleanup();
        }
    });
});

// Add welcome overlay styles to head
const welcomeStyles = document.createElement('style');
welcomeStyles.textContent = `
.welcome-content {
    background: linear-gradient(135deg, #1a1a3a, #2a2a4a);
    padding: 3rem;
    border-radius: 20px;
    border: 1px solid rgba(0, 212, 170, 0.3);
    text-align: center;
    max-width: 600px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.welcome-content h1 {
    color: #00d4aa;
    font-size: 2.5rem;
    margin-bottom: 2rem;
    text-shadow: 0 0 20px rgba(0, 212, 170, 0.6);
}

.welcome-info {
    margin: 2rem 0;
    font-size: 1.1rem;
}

.welcome-info p {
    margin: 1rem 0;
    color: #ffffff;
}

.welcome-controls {
    margin: 2rem 0;
}

.welcome-controls h3 {
    color: #00d4aa;
    margin-bottom: 1rem;
}

.controls-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.95rem;
}

.start-game-btn {
    background: linear-gradient(45deg, #00d4aa, #00ff88);
    color: #0f0f23;
    border: none;
    padding: 1.2rem 2.5rem;
    border-radius: 50px;
    font-family: 'Orbitron', monospace;
    font-weight: 900;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin: 2rem 0;
    box-shadow: 0 10px 30px rgba(0, 212, 170, 0.4);
}

.start-game-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 35px rgba(0, 212, 170, 0.6);
}

.tip {
    color: rgba(255, 255, 255, 0.7);
    font-style: italic;
    margin-top: 1rem;
}

@media (max-width: 768px) {
    .welcome-content {
        padding: 2rem;
        margin: 1rem;
    }
    
    .welcome-content h1 {
        font-size: 2rem;
    }
    
    .controls-list {
        grid-template-columns: 1fr;
    }
}
`;

document.head.appendChild(welcomeStyles);