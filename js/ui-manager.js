// UI Manager for Hedera GeoGuesser
class UIManager {
    constructor(gameLogic, hederaClient) {
        this.gameLogic = gameLogic;
        this.hederaClient = hederaClient;
        
        // UI elements
        this.loadingScreen = document.getElementById('loading-screen');
        this.gameContainer = document.getElementById('game-container');
        this.loadingProgress = document.getElementById('loading-progress');
        
        // Game UI elements
        this.currentScore = document.getElementById('current-score');
        this.currentRound = document.getElementById('current-round');
        this.hbarBalance = document.getElementById('hbar-balance');
        this.timer = document.getElementById('timer');
        this.distanceTraveled = document.getElementById('distance-traveled');
        this.walletConnectBtn = document.getElementById('wallet-connect');
        this.walletStatus = document.getElementById('wallet-status');
        this.walletAddress = document.getElementById('wallet-address');
        
        // Map elements
        this.mapCanvas = document.getElementById('map-canvas');
        this.mapCtx = this.mapCanvas.getContext('2d');
        this.guessMarker = document.getElementById('guess-marker');
        this.submitGuessBtn = document.getElementById('submit-guess');
        this.skipRoundBtn = document.getElementById('skip-round');
        
        // Modal elements
        this.resultsModal = document.getElementById('results-modal');
        this.gameCompleteModal = document.getElementById('game-complete-modal');
        
        // Current state
        this.currentGuess = null;
        this.isMapInitialized = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupMap();
        this.updateWalletStatus();
        
        // Bind game events
        this.gameLogic.onRoundStart = this.handleRoundStart.bind(this);
        this.gameLogic.onRoundComplete = this.handleRoundComplete.bind(this);
        this.gameLogic.onGameComplete = this.handleGameComplete.bind(this);
        this.gameLogic.onTimerUpdate = this.handleTimerUpdate.bind(this);
    }

    setupEventListeners() {
        // Wallet connection
        this.walletConnectBtn.addEventListener('click', this.handleWalletConnect.bind(this));
        
        // Game controls
        this.submitGuessBtn.addEventListener('click', this.handleSubmitGuess.bind(this));
        this.skipRoundBtn.addEventListener('click', this.handleSkipRound.bind(this));
        
        // Map interaction
        this.mapCanvas.addEventListener('click', this.handleMapClick.bind(this));
        
        // Modal controls
        document.getElementById('next-round').addEventListener('click', this.handleNextRound.bind(this));
        document.getElementById('play-again').addEventListener('click', this.handlePlayAgain.bind(this));
        document.getElementById('view-leaderboard').addEventListener('click', this.handleViewLeaderboard.bind(this));
        document.getElementById('view-nfts').addEventListener('click', this.handleViewNFTs.bind(this));
    }

    setupMap() {
        // Draw world map on canvas
        this.drawWorldMap();
        this.isMapInitialized = true;
    }

    drawWorldMap() {
        const ctx = this.mapCtx;
        const canvas = this.mapCanvas;
        
        // Clear canvas
        ctx.fillStyle = '#1a1a3a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw simple world map representation
        ctx.strokeStyle = '#00d4aa';
        ctx.lineWidth = 1;
        
        // Draw continents (simplified)
        this.drawSimplifiedContinents(ctx, canvas);
        
        // Draw grid lines
        ctx.strokeStyle = 'rgba(0, 212, 170, 0.3)';
        ctx.lineWidth = 0.5;
        
        // Latitude lines
        for (let i = 1; i < 6; i++) {
            const y = (canvas.height / 6) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Longitude lines
        for (let i = 1; i < 8; i++) {
            const x = (canvas.width / 8) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
    }

    drawSimplifiedContinents(ctx, canvas) {
        ctx.strokeStyle = '#00d4aa';
        ctx.fillStyle = 'rgba(0, 212, 170, 0.2)';
        
        // North America
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.2, canvas.height * 0.3, 40, 60, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // South America
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.25, canvas.height * 0.7, 25, 50, 0.2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Africa
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.53, canvas.height * 0.6, 30, 55, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Europe
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.5, canvas.height * 0.25, 25, 30, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Asia
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.7, canvas.height * 0.35, 50, 45, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Australia
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.8, canvas.height * 0.75, 20, 15, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    // Convert lat/lng to canvas coordinates
    latLngToCanvas(lat, lng) {
        const canvas = this.mapCanvas;
        const x = ((lng + 180) / 360) * canvas.width;
        const y = ((90 - lat) / 180) * canvas.height;
        return { x, y };
    }

    // Convert canvas coordinates to lat/lng
    canvasToLatLng(x, y) {
        const canvas = this.mapCanvas;
        const lng = (x / canvas.width) * 360 - 180;
        const lat = 90 - (y / canvas.height) * 180;
        return { lat, lng };
    }

    handleMapClick(event) {
        if (!this.gameLogic.isGameActive) return;
        
        const rect = this.mapCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Convert to lat/lng
        this.currentGuess = this.canvasToLatLng(x, y);
        
        // Show marker
        this.showGuessMarker(x, y);
        
        // Enable submit button
        this.submitGuessBtn.disabled = false;
        
        console.log('Guess placed:', this.currentGuess);
    }

    showGuessMarker(x, y) {
        this.guessMarker.style.display = 'block';
        this.guessMarker.style.left = x + 'px';
        this.guessMarker.style.top = y + 'px';
    }

    hideGuessMarker() {
        this.guessMarker.style.display = 'none';
        this.submitGuessBtn.disabled = true;
    }

    async handleWalletConnect() {
        try {
            this.walletConnectBtn.disabled = true;
            this.walletConnectBtn.textContent = 'Connecting...';
            
            const walletInfo = await this.hederaClient.connectWallet();
            this.updateWalletStatus();
            
        } catch (error) {
            alert('Failed to connect wallet: ' + error.message);
            console.error('Wallet connection error:', error);
        } finally {
            this.walletConnectBtn.disabled = false;
            this.walletConnectBtn.textContent = 'Connect Wallet';
        }
    }

    updateWalletStatus() {
        if (this.hederaClient.isConnected) {
            this.walletConnectBtn.style.display = 'none';
            this.walletStatus.style.display = 'flex';
            this.walletAddress.textContent = this.hederaClient.operatorId.substring(0, 10) + '...';
            this.updateHBARBalance();
        } else {
            this.walletConnectBtn.style.display = 'block';
            this.walletStatus.style.display = 'none';
        }
    }

    async updateHBARBalance() {
        if (this.hederaClient.isConnected) {
            try {
                const balance = await this.hederaClient.getBalance();
                this.hbarBalance.textContent = balance.toFixed(2);
            } catch (error) {
                console.error('Failed to update HBAR balance:', error);
            }
        }
    }

    handleSubmitGuess() {
        if (!this.currentGuess || !this.gameLogic.isGameActive) return;
        
        // Get distance traveled from player controller (will be passed from app)
        const distanceTraveled = window.playerController ? window.playerController.getDistanceTraveled() : 0;
        
        this.gameLogic.submitGuess(this.currentGuess.lat, this.currentGuess.lng, distanceTraveled);
        this.hideGuessMarker();
    }

    handleSkipRound() {
        if (!this.gameLogic.isGameActive) return;
        
        this.gameLogic.skipRound();
        this.hideGuessMarker();
    }

    handleNextRound() {
        this.hideModal(this.resultsModal);
        this.gameLogic.startNextRound();
    }

    handlePlayAgain() {
        this.hideModal(this.gameCompleteModal);
        this.gameLogic.startGame();
    }

    handleViewLeaderboard() {
        // TODO: Implement leaderboard view
        alert('Leaderboard feature coming soon!');
    }

    handleViewNFTs() {
        // TODO: Implement NFT gallery
        alert('NFT gallery feature coming soon!');
    }

    // Game event handlers
    handleRoundStart(round, location) {
        this.currentRound.textContent = round;
        this.hideGuessMarker();
        
        // Update location info (without revealing the answer)
        document.querySelector('.location-info p').textContent = 
            `Round ${round}: Explore this ${location.biome} environment and make your best guess!`;
    }

    handleRoundComplete(result) {
        // Update score display
        this.currentScore.textContent = this.gameLogic.totalScore;
        
        // Show results modal
        this.showRoundResults(result);
    }

    handleGameComplete(stats) {
        // Update HBAR balance if rewards were earned
        if (stats.hbarReward && stats.hbarReward.success) {
            this.updateHBARBalance();
        }
        
        // Show game complete modal
        this.showGameResults(stats);
    }

    handleTimerUpdate(timeRemaining) {
        this.timer.textContent = timeRemaining + 's';
        
        // Change color when time is running low
        if (timeRemaining <= 30) {
            this.timer.style.color = '#ff4444';
        } else {
            this.timer.style.color = '#00d4aa';
        }
    }

    showRoundResults(result) {
        // Update result elements
        document.getElementById('result-distance').textContent = Math.round(result.distance);
        document.getElementById('result-points').textContent = result.score;
        document.getElementById('actual-location').textContent = result.actualLocation.name;
        
        // Calculate and show accuracy
        const maxDistance = 20000; // Max possible distance for calculation
        const accuracy = Math.max(0, 100 - (result.distance / maxDistance * 100));
        const accuracyFill = document.getElementById('accuracy-fill');
        accuracyFill.style.width = accuracy + '%';
        
        // Show HBAR earned (if wallet connected)
        const hbarEarned = result.score * 0.0001; // Mock calculation
        document.getElementById('result-hbar').textContent = hbarEarned.toFixed(4);
        
        this.showModal(this.resultsModal);
    }

    showGameResults(stats) {
        // Update final score
        document.getElementById('final-score').textContent = stats.totalScore;
        
        // Update score breakdown
        document.getElementById('accuracy-bonus').textContent = Math.round(stats.totalScore * 0.1);
        document.getElementById('speed-bonus').textContent = Math.round(stats.totalScore * 0.05);
        document.getElementById('exploration-bonus').textContent = Math.round(stats.totalScore * 0.05);
        
        // Show total HBAR earned
        const totalHbar = stats.hbarReward ? stats.hbarReward.amount : 0;
        document.getElementById('total-hbar').textContent = totalHbar.toFixed(4);
        
        // Show NFT reward if any
        if (stats.achievements.length > 0) {
            document.getElementById('nft-reward').style.display = 'block';
        }
        
        this.showModal(this.gameCompleteModal);
    }

    showModal(modal) {
        modal.style.display = 'flex';
    }

    hideModal(modal) {
        modal.style.display = 'none';
    }

    // Loading screen management
    showLoading() {
        this.loadingScreen.style.display = 'flex';
        this.gameContainer.style.display = 'none';
    }

    hideLoading() {
        this.loadingScreen.style.display = 'none';
        this.gameContainer.style.display = 'block';
    }

    updateLoadingProgress(percentage) {
        this.loadingProgress.style.width = percentage + '%';
    }

    // Update distance traveled display
    updateDistanceTraveled(distance) {
        this.distanceTraveled.textContent = Math.round(distance) + 'm';
    }

    // Update game UI with current state
    updateGameUI() {
        const gameState = this.gameLogic.getGameState();
        
        if (gameState.isActive) {
            this.currentScore.textContent = gameState.totalScore;
            this.currentRound.textContent = gameState.currentRound;
        }
        
        // Update wallet balance periodically
        if (this.hederaClient.isConnected) {
            this.updateHBARBalance();
        }
    }

    // Start periodic UI updates
    startUIUpdates() {
        setInterval(() => {
            this.updateGameUI();
        }, 1000);
    }
}

// Export UIManager
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}