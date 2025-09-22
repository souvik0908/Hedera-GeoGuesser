// Hedera GeoGuesser Configuration
const CONFIG = {
    // Game Settings
    GAME: {
        ROUNDS_PER_GAME: 5,
        TIME_PER_ROUND: 120, // seconds
        MIN_DISTANCE_FOR_BONUS: 100, // km
        MAX_SCORE_PER_ROUND: 5000,
        EXPLORATION_RADIUS: 1000, // meters
        SPEED_BONUS_THRESHOLD: 60, // seconds
    },

    // Hedera Network Configuration
    HEDERA: {
        // Using Hedera Testnet for development
        NETWORK: 'testnet',
        OPERATOR_ID: null, // Will be set when wallet connects
        OPERATOR_KEY: null, // Will be set when wallet connects
        
        // Token Configuration (for demo purposes)
        HBAR_REWARD_BASE: 0.1, // Base HBAR reward
        HBAR_REWARD_MULTIPLIER: 0.05, // Additional HBAR per 1000 points
        
        // NFT Configuration
        NFT_CONTRACT_ID: null, // Will be deployed or configured
        ACHIEVEMENT_THRESHOLDS: {
            PERFECT_ROUND: 5000, // Perfect score in a round
            SPEED_DEMON: 30, // Complete round in under 30 seconds
            EXPLORER: 10, // Play 10 games
            GEOGRAPHY_MASTER: 20000, // Achieve 20k+ total score
        }
    },

    // 3D World Configuration
    WORLD: {
        TERRAIN_SIZE: 2048,
        TERRAIN_SEGMENTS: 512,
        WATER_LEVEL: 0.1,
        MOUNTAIN_HEIGHT: 0.8,
        TEXTURE_RESOLUTION: 1024,
        VIEW_DISTANCE: 5000,
        FOG_DENSITY: 0.0005,
    },

    // Location Database (Real world locations for the game)
    LOCATIONS: [
        {
            id: 'eiffel_tower',
            name: 'Eiffel Tower, Paris',
            country: 'France',
            lat: 48.8584,
            lng: 2.2945,
            biome: 'urban',
            difficulty: 'easy',
            landmarks: ['tower', 'city', 'river'],
            description: 'Iconic iron tower in the heart of Paris'
        },
        {
            id: 'grand_canyon',
            name: 'Grand Canyon, Arizona',
            country: 'United States',
            lat: 36.1069,
            lng: -112.1129,
            biome: 'desert',
            difficulty: 'medium',
            landmarks: ['canyon', 'rocks', 'desert'],
            description: 'Massive canyon with layered rock formations'
        },
        {
            id: 'machu_picchu',
            name: 'Machu Picchu, Peru',
            country: 'Peru',
            lat: -13.1631,
            lng: -72.5450,
            biome: 'mountain',
            difficulty: 'hard',
            landmarks: ['ruins', 'mountains', 'clouds'],
            description: 'Ancient Incan citadel high in the Andes'
        },
        {
            id: 'sahara_desert',
            name: 'Sahara Desert, Morocco',
            country: 'Morocco',
            lat: 25.0000,
            lng: -5.0000,
            biome: 'desert',
            difficulty: 'hard',
            landmarks: ['dunes', 'sand', 'sparse_vegetation'],
            description: 'Vast sand dunes in the world\'s largest hot desert'
        },
        {
            id: 'mount_fuji',
            name: 'Mount Fuji, Japan',
            country: 'Japan',
            lat: 35.3606,
            lng: 138.7274,
            biome: 'mountain',
            difficulty: 'medium',
            landmarks: ['volcano', 'snow_cap', 'lake'],
            description: 'Sacred stratovolcano and Japan\'s highest peak'
        },
        {
            id: 'amazon_rainforest',
            name: 'Amazon Rainforest, Brazil',
            country: 'Brazil',
            lat: -3.4653,
            lng: -62.2159,
            biome: 'tropical',
            difficulty: 'hard',
            landmarks: ['dense_forest', 'river', 'wildlife'],
            description: 'Dense tropical rainforest with incredible biodiversity'
        },
        {
            id: 'great_wall',
            name: 'Great Wall of China',
            country: 'China',
            lat: 40.4319,
            lng: 116.5704,
            biome: 'mountain',
            difficulty: 'medium',
            landmarks: ['wall', 'mountains', 'fortifications'],
            description: 'Ancient fortification system across northern China'
        },
        {
            id: 'victoria_falls',
            name: 'Victoria Falls, Zambia/Zimbabwe',
            country: 'Zambia',
            lat: -17.9243,
            lng: 25.8572,
            biome: 'savanna',
            difficulty: 'medium',
            landmarks: ['waterfall', 'river', 'mist'],
            description: 'Massive waterfall on the Zambezi River'
        },
        {
            id: 'santorini',
            name: 'Santorini, Greece',
            country: 'Greece',
            lat: 36.3932,
            lng: 25.4615,
            biome: 'mediterranean',
            difficulty: 'easy',
            landmarks: ['white_buildings', 'blue_domes', 'sea'],
            description: 'Picturesque volcanic island with white-washed buildings'
        },
        {
            id: 'antarctica',
            name: 'Antarctica Research Station',
            country: 'Antarctica',
            lat: -77.8500,
            lng: 166.6667,
            biome: 'polar',
            difficulty: 'hard',
            landmarks: ['ice', 'research_station', 'penguins'],
            description: 'Remote research station in the frozen continent'
        }
    ],

    // Scoring Configuration
    SCORING: {
        DISTANCE_BRACKETS: [
            { max: 1, points: 5000 },      // Perfect guess (within 1km)
            { max: 10, points: 4500 },     // Excellent (within 10km)
            { max: 50, points: 4000 },     // Great (within 50km)
            { max: 200, points: 3000 },    // Good (within 200km)
            { max: 500, points: 2000 },    // Fair (within 500km)
            { max: 1000, points: 1000 },   // Poor (within 1000km)
            { max: 2000, points: 500 },    // Very poor (within 2000km)
            { max: Infinity, points: 100 } // Terrible (over 2000km)
        ],
        
        TIME_BONUS_MULTIPLIER: 1.5,  // Bonus multiplier for fast guesses
        EXPLORATION_BONUS: 100,      // Bonus points per 100m explored
        PERFECT_ROUND_BONUS: 1000,   // Bonus for perfect round
        STREAK_MULTIPLIER: 1.2       // Multiplier for consecutive good rounds
    },

    // UI Configuration
    UI: {
        ANIMATION_DURATION: 300,
        LOADING_STEPS: 8,
        MAP_ZOOM_LEVELS: {
            MIN: 1,
            MAX: 10,
            DEFAULT: 2
        }
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}