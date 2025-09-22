// Game Logic Controller
class GameLogic {
    constructor(worldGenerator, hederaClient) {
        this.worldGenerator = worldGenerator;
        this.hederaClient = hederaClient;
        
        // Game state
        this.currentRound = 0;
        this.totalScore = 0;
        this.roundScore = 0;
        this.currentLocation = null;
        this.gameStartTime = null;
        this.roundStartTime = null;
        this.gameSession = Date.now();
        this.roundResults = [];
        
        // Timer
        this.timeRemaining = CONFIG.GAME.TIME_PER_ROUND;
        this.timerInterval = null;
        
        // Player stats
        this.playerStats = {
            totalGamesPlayed: parseInt(localStorage.getItem('geoguess_games_played') || '0'),
            totalScore: parseInt(localStorage.getItem('geoguess_total_score') || '0'),
            bestScore: parseInt(localStorage.getItem('geoguess_best_score') || '0'),
            achievements: JSON.parse(localStorage.getItem('geoguess_achievements') || '[]')
        };
        
        this.isGameActive = false;
        this.currentGuess = null;
    }

    // Start a new game
    startGame() {
        this.currentRound = 0;
        this.totalScore = 0;
        this.gameStartTime = Date.now();
        this.gameSession = Date.now();
        this.roundResults = [];
        this.isGameActive = true;
        
        console.log('Starting new game session:', this.gameSession);
        this.startNextRound();
    }

    // Start the next round
    startNextRound() {
        if (this.currentRound >= CONFIG.GAME.ROUNDS_PER_GAME) {
            this.endGame();
            return;
        }

        this.currentRound++;
        this.roundScore = 0;
        this.roundStartTime = Date.now();
        this.timeRemaining = CONFIG.GAME.TIME_PER_ROUND;
        this.currentGuess = null;
        
        // Select random location
        this.currentLocation = this.selectRandomLocation();
        
        // Generate world for this location
        this.worldGenerator.generateWorld(this.currentLocation);
        
        // Start round timer
        this.startRoundTimer();
        
        console.log(`Round ${this.currentRound} started: ${this.currentLocation.name}`);
        
        // Trigger UI update
        this.onRoundStart(this.currentRound, this.currentLocation);
    }

    selectRandomLocation() {
        // Filter locations based on difficulty or use all
        const availableLocations = CONFIG.LOCATIONS.filter(loc => true); // Can add difficulty filtering
        const randomIndex = Math.floor(Math.random() * availableLocations.length);
        return { ...availableLocations[randomIndex] };
    }

    startRoundTimer() {
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            
            // Update UI timer
            this.onTimerUpdate(this.timeRemaining);
            
            if (this.timeRemaining <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    stopRoundTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    // Handle player guess
    submitGuess(guessLat, guessLng, distanceTraveled) {
        if (!this.isGameActive || !this.currentLocation) {
            return;
        }

        this.stopRoundTimer();
        
        const timeTaken = CONFIG.GAME.TIME_PER_ROUND - this.timeRemaining;
        const distance = this.calculateDistance(
            this.currentLocation.lat,
            this.currentLocation.lng,
            guessLat,
            guessLng
        );

        // Calculate score
        const score = this.calculateScore(distance, timeTaken, distanceTraveled);
        this.roundScore = score;
        this.totalScore += score;

        // Store round result
        const roundResult = {
            round: this.currentRound,
            actualLocation: {
                lat: this.currentLocation.lat,
                lng: this.currentLocation.lng,
                name: this.currentLocation.name
            },
            guessLocation: { lat: guessLat, lng: guessLng },
            distance: distance,
            score: score,
            timeTaken: timeTaken,
            distanceTraveled: distanceTraveled
        };

        this.roundResults.push(roundResult);

        console.log('Round result:', roundResult);

        // Trigger UI update
        this.onRoundComplete(roundResult);
    }

    // Skip current round
    skipRound() {
        if (!this.isGameActive) return;

        this.submitGuess(0, 0, 0); // Submit a default guess at 0,0
    }

    // Time up for current round
    timeUp() {
        console.log('Time up for round', this.currentRound);
        this.skipRound();
    }

    // Calculate distance between two points using Haversine formula
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    // Calculate score based on distance, time, and exploration
    calculateScore(distance, timeTaken, distanceTraveled) {
        let baseScore = 0;

        // Distance-based scoring
        for (const bracket of CONFIG.SCORING.DISTANCE_BRACKETS) {
            if (distance <= bracket.max) {
                baseScore = bracket.points;
                break;
            }
        }

        // Time bonus
        let timeBonus = 0;
        if (timeTaken <= CONFIG.GAME.SPEED_BONUS_THRESHOLD) {
            timeBonus = Math.floor(baseScore * 0.2 * (CONFIG.GAME.SPEED_BONUS_THRESHOLD - timeTaken) / CONFIG.GAME.SPEED_BONUS_THRESHOLD);
        }

        // Exploration bonus
        const explorationBonus = Math.floor(distanceTraveled / 100) * CONFIG.SCORING.EXPLORATION_BONUS;

        // Perfect round bonus
        const perfectBonus = (baseScore >= CONFIG.GAME.MAX_SCORE_PER_ROUND * 0.95) ? CONFIG.SCORING.PERFECT_ROUND_BONUS : 0;

        const totalScore = baseScore + timeBonus + explorationBonus + perfectBonus;

        return Math.max(0, Math.min(totalScore, CONFIG.GAME.MAX_SCORE_PER_ROUND));
    }

    // End the current game
    async endGame() {
        this.stopRoundTimer();
        this.isGameActive = false;

        // Calculate final statistics
        const gameStats = this.calculateGameStats();

        // Update player stats
        this.updatePlayerStats(gameStats);

        // Check for achievements
        const newAchievements = this.checkAchievements(gameStats);

        // Award HBAR if wallet is connected
        let hbarReward = null;
        if (this.hederaClient.isConnected) {
            try {
                hbarReward = await this.hederaClient.awardHBAR(this.totalScore, this.roundScore);
            } catch (error) {
                console.error('Failed to award HBAR:', error);
            }
        }

        // Mint achievement NFTs
        const nftRewards = [];
        for (const achievement of newAchievements) {
            if (this.hederaClient.isConnected) {
                try {
                    const nft = await this.hederaClient.mintAchievementNFT(achievement.type, {
                        description: achievement.description,
                        score: this.totalScore
                    });
                    if (nft.success) {
                        nftRewards.push(nft);
                    }
                } catch (error) {
                    console.error('Failed to mint NFT:', error);
                }
            }
        }

        // Submit score to leaderboard
        if (this.hederaClient.isConnected) {
            try {
                await this.hederaClient.submitScore({
                    score: this.totalScore,
                    rounds: this.roundResults,
                    gameSession: this.gameSession
                });
            } catch (error) {
                console.error('Failed to submit score:', error);
            }
        }

        // Trigger game complete UI
        this.onGameComplete({
            ...gameStats,
            achievements: newAchievements,
            hbarReward: hbarReward,
            nftRewards: nftRewards
        });

        console.log('Game completed:', gameStats);
    }

    calculateGameStats() {
        const totalTime = (Date.now() - this.gameStartTime) / 1000;
        const averageDistance = this.roundResults.reduce((sum, r) => sum + r.distance, 0) / this.roundResults.length;
        const averageScore = this.totalScore / this.roundResults.length;
        const perfectRounds = this.roundResults.filter(r => r.score >= CONFIG.GAME.MAX_SCORE_PER_ROUND * 0.95).length;

        return {
            totalScore: this.totalScore,
            rounds: this.roundResults,
            averageDistance: Math.round(averageDistance),
            averageScore: Math.round(averageScore),
            totalTime: Math.round(totalTime),
            perfectRounds: perfectRounds,
            gameSession: this.gameSession
        };
    }

    updatePlayerStats(gameStats) {
        this.playerStats.totalGamesPlayed++;
        this.playerStats.totalScore += gameStats.totalScore;
        
        if (gameStats.totalScore > this.playerStats.bestScore) {
            this.playerStats.bestScore = gameStats.totalScore;
        }

        // Save to localStorage
        localStorage.setItem('geoguess_games_played', this.playerStats.totalGamesPlayed.toString());
        localStorage.setItem('geoguess_total_score', this.playerStats.totalScore.toString());
        localStorage.setItem('geoguess_best_score', this.playerStats.bestScore.toString());
    }

    checkAchievements(gameStats) {
        const newAchievements = this.hederaClient.checkAchievements({
            lastRoundScore: this.roundScore,
            lastRoundTime: gameStats.rounds[gameStats.rounds.length - 1]?.timeTaken || 0,
            totalGamesPlayed: this.playerStats.totalGamesPlayed,
            totalScore: this.playerStats.totalScore
        });

        // Add new achievements to player stats
        for (const achievement of newAchievements) {
            if (!this.playerStats.achievements.find(a => a.type === achievement.type)) {
                this.playerStats.achievements.push({
                    ...achievement,
                    unlockedAt: Date.now()
                });
            }
        }

        // Save achievements
        localStorage.setItem('geoguess_achievements', JSON.stringify(this.playerStats.achievements));

        return newAchievements;
    }

    // Event handlers (to be implemented by UI manager)
    onRoundStart(round, location) {
        // Override this method
    }

    onRoundComplete(result) {
        // Override this method
    }

    onGameComplete(stats) {
        // Override this method
    }

    onTimerUpdate(timeRemaining) {
        // Override this method
    }

    // Get current game state
    getGameState() {
        return {
            isActive: this.isGameActive,
            currentRound: this.currentRound,
            totalRounds: CONFIG.GAME.ROUNDS_PER_GAME,
            totalScore: this.totalScore,
            timeRemaining: this.timeRemaining,
            currentLocation: this.currentLocation
        };
    }

    // Get player statistics
    getPlayerStats() {
        return { ...this.playerStats };
    }
}

// Export GameLogic
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameLogic;
}