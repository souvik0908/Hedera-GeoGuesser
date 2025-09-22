// Hedera Client for blockchain integration
class HederaClient {
    constructor() {
        this.client = null;
        this.operatorId = null;
        this.operatorKey = null;
        this.isConnected = false;
        this.walletBalance = 0;
    }

    // Initialize Hedera client
    async initialize() {
        try {
            // Check if Hedera SDK is available
            if (typeof Hedera === 'undefined') {
                console.warn('Hedera SDK not loaded, using mock client');
                this.initializeMockClient();
                return;
            }

            // For demo purposes, we'll use a mock implementation
            // In production, this would connect to actual Hedera network
            this.initializeMockClient();
            
        } catch (error) {
            console.error('Failed to initialize Hedera client:', error);
            this.initializeMockClient();
        }
    }

    // Mock client for demo purposes
    initializeMockClient() {
        console.log('Initializing mock Hedera client for demo');
        this.client = {
            // Mock client methods
            getAccountBalance: () => Promise.resolve({ hbars: this.walletBalance }),
            submitTransaction: (transaction) => Promise.resolve({ 
                transactionId: 'mock-' + Date.now(),
                receipt: { status: 'SUCCESS' }
            })
        };
        this.isConnected = false;
    }

    // Connect wallet (in real implementation, this would use HashPack or similar)
    async connectWallet() {
        try {
            // Mock wallet connection for demo
            return new Promise((resolve) => {
                setTimeout(() => {
                    this.operatorId = '0.0.123456';
                    this.operatorKey = 'mock-private-key';
                    this.isConnected = true;
                    this.walletBalance = 100; // Mock balance
                    
                    console.log('Mock wallet connected successfully');
                    resolve({
                        accountId: this.operatorId,
                        balance: this.walletBalance
                    });
                }, 1000);
            });

        } catch (error) {
            console.error('Failed to connect wallet:', error);
            throw new Error('Wallet connection failed');
        }
    }

    // Disconnect wallet
    async disconnectWallet() {
        this.operatorId = null;
        this.operatorKey = null;
        this.isConnected = false;
        this.walletBalance = 0;
        console.log('Wallet disconnected');
    }

    // Get account balance
    async getBalance() {
        if (!this.isConnected) {
            return 0;
        }

        try {
            const balance = await this.client.getAccountBalance();
            this.walletBalance = parseFloat(balance.hbars) || this.walletBalance;
            return this.walletBalance;
        } catch (error) {
            console.error('Failed to get balance:', error);
            return this.walletBalance;
        }
    }

    // Award HBAR tokens based on score
    async awardHBAR(score, roundScore) {
        if (!this.isConnected) {
            console.warn('Wallet not connected, cannot award HBAR');
            return { success: false, error: 'Wallet not connected' };
        }

        try {
            // Calculate HBAR reward
            const baseReward = CONFIG.HEDERA.HBAR_REWARD_BASE;
            const bonusReward = Math.floor(score / 1000) * CONFIG.HEDERA.HBAR_REWARD_MULTIPLIER;
            const totalReward = baseReward + bonusReward;

            // Mock transaction for demo
            const transaction = {
                type: 'HBAR_TRANSFER',
                amount: totalReward,
                recipient: this.operatorId,
                memo: `GeoGuesser reward - Score: ${score}`
            };

            const result = await this.client.submitTransaction(transaction);
            
            // Update mock balance
            this.walletBalance += totalReward;

            console.log(`Awarded ${totalReward} HBAR for score ${score}`);
            
            return {
                success: true,
                amount: totalReward,
                transactionId: result.transactionId,
                newBalance: this.walletBalance
            };

        } catch (error) {
            console.error('Failed to award HBAR:', error);
            return { success: false, error: error.message };
        }
    }

    // Mint achievement NFT
    async mintAchievementNFT(achievementType, metadata) {
        if (!this.isConnected) {
            console.warn('Wallet not connected, cannot mint NFT');
            return { success: false, error: 'Wallet not connected' };
        }

        try {
            // Mock NFT minting
            const nftId = `nft-${achievementType}-${Date.now()}`;
            
            const nftMetadata = {
                name: `GeoGuesser ${achievementType} Achievement`,
                description: metadata.description || 'Achievement earned in Hedera GeoGuesser',
                image: metadata.image || 'https://example.com/achievement.png',
                attributes: [
                    { trait_type: 'Game', value: 'Hedera GeoGuesser' },
                    { trait_type: 'Achievement', value: achievementType },
                    { trait_type: 'Earned Date', value: new Date().toISOString() },
                    { trait_type: 'Score', value: metadata.score?.toString() || '0' }
                ]
            };

            // Mock transaction
            const transaction = {
                type: 'NFT_MINT',
                metadata: nftMetadata,
                recipient: this.operatorId
            };

            const result = await this.client.submitTransaction(transaction);

            console.log(`Minted achievement NFT: ${achievementType}`);

            return {
                success: true,
                nftId: nftId,
                metadata: nftMetadata,
                transactionId: result.transactionId
            };

        } catch (error) {
            console.error('Failed to mint NFT:', error);
            return { success: false, error: error.message };
        }
    }

    // Submit score to leaderboard (stored on Hedera Consensus Service)
    async submitScore(playerData) {
        if (!this.isConnected) {
            console.warn('Wallet not connected, cannot submit score');
            return { success: false, error: 'Wallet not connected' };
        }

        try {
            const scoreData = {
                playerId: this.operatorId,
                score: playerData.score,
                rounds: playerData.rounds,
                timestamp: Date.now(),
                gameSession: playerData.gameSession || Date.now()
            };

            // Mock consensus service submission
            const transaction = {
                type: 'CONSENSUS_MESSAGE',
                topicId: 'mock-leaderboard-topic',
                message: JSON.stringify(scoreData)
            };

            const result = await this.client.submitTransaction(transaction);

            console.log('Score submitted to leaderboard:', scoreData);

            return {
                success: true,
                transactionId: result.transactionId,
                scoreData: scoreData
            };

        } catch (error) {
            console.error('Failed to submit score:', error);
            return { success: false, error: error.message };
        }
    }

    // Get leaderboard data
    async getLeaderboard(limit = 10) {
        try {
            // Mock leaderboard data
            const mockLeaderboard = [
                { playerId: '0.0.111111', score: 22500, rounds: 5, timestamp: Date.now() - 86400000 },
                { playerId: '0.0.222222', score: 21800, rounds: 5, timestamp: Date.now() - 172800000 },
                { playerId: '0.0.333333', score: 20100, rounds: 5, timestamp: Date.now() - 259200000 },
                { playerId: '0.0.444444', score: 19750, rounds: 5, timestamp: Date.now() - 345600000 },
                { playerId: '0.0.555555', score: 18900, rounds: 5, timestamp: Date.now() - 432000000 }
            ];

            return {
                success: true,
                leaderboard: mockLeaderboard.slice(0, limit)
            };

        } catch (error) {
            console.error('Failed to get leaderboard:', error);
            return { success: false, error: error.message };
        }
    }

    // Check for achievement unlocks
    checkAchievements(gameData) {
        const achievements = [];
        const thresholds = CONFIG.HEDERA.ACHIEVEMENT_THRESHOLDS;

        // Perfect Round Achievement
        if (gameData.lastRoundScore >= thresholds.PERFECT_ROUND) {
            achievements.push({
                type: 'PERFECT_ROUND',
                name: 'Perfect Round',
                description: 'Scored maximum points in a single round',
                icon: '🎯'
            });
        }

        // Speed Demon Achievement
        if (gameData.lastRoundTime <= thresholds.SPEED_DEMON) {
            achievements.push({
                type: 'SPEED_DEMON',
                name: 'Speed Demon',
                description: 'Completed a round in under 30 seconds',
                icon: '⚡'
            });
        }

        // Explorer Achievement
        if (gameData.totalGamesPlayed >= thresholds.EXPLORER) {
            achievements.push({
                type: 'EXPLORER',
                name: 'Explorer',
                description: 'Played 10 games',
                icon: '🗺️'
            });
        }

        // Geography Master Achievement
        if (gameData.totalScore >= thresholds.GEOGRAPHY_MASTER) {
            achievements.push({
                type: 'GEOGRAPHY_MASTER',
                name: 'Geography Master',
                description: 'Achieved a total score of 20,000+',
                icon: '🌍'
            });
        }

        return achievements;
    }
}

// Export HederaClient
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HederaClient;
}