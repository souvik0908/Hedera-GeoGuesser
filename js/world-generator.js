// 3D World Generator using Three.js
class WorldGenerator {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.currentLocation = null;
        this.terrain = null;
        this.skybox = null;
        this.landmarks = [];
        
        this.init();
    }

    init() {
        // Initialize Three.js scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87CEEB, 100, CONFIG.WORLD.VIEW_DISTANCE);

        // Setup camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            this.canvas.clientWidth / this.canvas.clientHeight, 
            0.1, 
            CONFIG.WORLD.VIEW_DISTANCE
        );
        this.camera.position.set(0, 10, 0);

        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            antialias: true 
        });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x87CEEB, 1);

        // Setup lighting
        this.setupLighting();

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);

        // Hemisphere light for better outdoor lighting
        const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x8B4513, 0.4);
        this.scene.add(hemisphereLight);
    }

    // Generate world based on location data
    generateWorld(locationData) {
        this.currentLocation = locationData;
        this.clearWorld();

        // Generate terrain based on biome
        this.generateTerrain(locationData.biome);
        
        // Generate skybox
        this.generateSkybox(locationData.biome);
        
        // Add landmarks
        this.generateLandmarks(locationData);
        
        // Set initial camera position
        this.positionCamera(locationData);

        console.log(`Generated world for: ${locationData.name}`);
    }

    generateTerrain(biome) {
        const geometry = new THREE.PlaneGeometry(
            CONFIG.WORLD.TERRAIN_SIZE, 
            CONFIG.WORLD.TERRAIN_SIZE, 
            CONFIG.WORLD.TERRAIN_SEGMENTS, 
            CONFIG.WORLD.TERRAIN_SEGMENTS
        );

        // Generate height map based on biome
        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 2];
            vertices[i + 1] = this.getTerrainHeight(x, z, biome);
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();

        // Create material based on biome
        const material = this.getTerrainMaterial(biome);
        
        this.terrain = new THREE.Mesh(geometry, material);
        this.terrain.rotation.x = -Math.PI / 2;
        this.terrain.receiveShadow = true;
        this.scene.add(this.terrain);
    }

    getTerrainHeight(x, z, biome) {
        const scale = 0.01;
        let height = 0;

        // Base noise
        height += Math.sin(x * scale) * Math.cos(z * scale) * 20;
        height += Math.sin(x * scale * 2) * Math.cos(z * scale * 2) * 10;
        height += Math.sin(x * scale * 4) * Math.cos(z * scale * 4) * 5;

        // Biome-specific height modifications
        switch (biome) {
            case 'mountain':
                height *= 3;
                height += Math.abs(Math.sin(x * scale * 0.5)) * 50;
                break;
            case 'desert':
                height *= 0.5;
                height += Math.sin(x * scale * 0.3) * Math.cos(z * scale * 0.3) * 15;
                break;
            case 'urban':
                height *= 0.3;
                break;
            case 'tropical':
                height *= 1.5;
                height += Math.random() * 10;
                break;
            case 'polar':
                height *= 0.8;
                break;
            case 'savanna':
                height *= 0.7;
                height += Math.sin(x * scale * 0.8) * 8;
                break;
            case 'mediterranean':
                height *= 1.2;
                break;
            default:
                height *= 1;
        }

        return Math.max(height, CONFIG.WORLD.WATER_LEVEL);
    }

    getTerrainMaterial(biome) {
        let color, roughness, metalness;

        switch (biome) {
            case 'mountain':
                color = 0x8B7355;
                roughness = 0.9;
                metalness = 0.1;
                break;
            case 'desert':
                color = 0xDEB887;
                roughness = 0.8;
                metalness = 0.0;
                break;
            case 'urban':
                color = 0x696969;
                roughness = 0.4;
                metalness = 0.2;
                break;
            case 'tropical':
                color = 0x228B22;
                roughness = 0.9;
                metalness = 0.0;
                break;
            case 'polar':
                color = 0xF0F8FF;
                roughness = 0.1;
                metalness = 0.0;
                break;
            case 'savanna':
                color = 0xDAA520;
                roughness = 0.8;
                metalness = 0.0;
                break;
            case 'mediterranean':
                color = 0xD2B48C;
                roughness = 0.7;
                metalness = 0.0;
                break;
            default:
                color = 0x90EE90;
                roughness = 0.8;
                metalness = 0.0;
        }

        return new THREE.MeshStandardMaterial({
            color: color,
            roughness: roughness,
            metalness: metalness
        });
    }

    generateSkybox(biome) {
        let skyColor, fogColor;

        switch (biome) {
            case 'desert':
                skyColor = 0xFFE4B5;
                fogColor = 0xDEB887;
                break;
            case 'polar':
                skyColor = 0xE6E6FA;
                fogColor = 0xF0F8FF;
                break;
            case 'tropical':
                skyColor = 0x87CEEB;
                fogColor = 0x98FB98;
                break;
            case 'mountain':
                skyColor = 0x4682B4;
                fogColor = 0x708090;
                break;
            case 'urban':
                skyColor = 0x87CEEB;
                fogColor = 0xC0C0C0;
                break;
            default:
                skyColor = 0x87CEEB;
                fogColor = 0x87CEEB;
        }

        // Update scene background and fog
        this.scene.background = new THREE.Color(skyColor);
        this.scene.fog.color.setHex(fogColor);

        // Create skybox sphere
        const skyGeometry = new THREE.SphereGeometry(CONFIG.WORLD.VIEW_DISTANCE * 0.9, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: skyColor,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.8
        });

        this.skybox = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(this.skybox);
    }

    generateLandmarks(locationData) {
        this.landmarks = [];

        locationData.landmarks.forEach((landmarkType, index) => {
            const landmark = this.createLandmark(landmarkType, index);
            if (landmark) {
                this.landmarks.push(landmark);
                this.scene.add(landmark);
            }
        });
    }

    createLandmark(type, index) {
        const angle = (index / 3) * Math.PI * 2;
        const distance = 100 + Math.random() * 200;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        const y = this.getTerrainHeight(x, z, this.currentLocation.biome);

        let geometry, material, landmark;

        switch (type) {
            case 'tower':
                geometry = new THREE.CylinderGeometry(2, 4, 100, 8);
                material = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
                landmark = new THREE.Mesh(geometry, material);
                landmark.position.set(x, y + 50, z);
                break;

            case 'canyon':
                // Create a depression in terrain (handled in terrain generation)
                geometry = new THREE.BoxGeometry(50, 20, 200);
                material = new THREE.MeshStandardMaterial({ color: 0xCD853F });
                landmark = new THREE.Mesh(geometry, material);
                landmark.position.set(x, y - 10, z);
                break;

            case 'ruins':
                geometry = new THREE.BoxGeometry(20, 15, 20);
                material = new THREE.MeshStandardMaterial({ color: 0x808080 });
                landmark = new THREE.Mesh(geometry, material);
                landmark.position.set(x, y + 7.5, z);
                break;

            case 'dunes':
                geometry = new THREE.SphereGeometry(30, 16, 16);
                geometry.scale(1, 0.3, 1);
                material = new THREE.MeshStandardMaterial({ color: 0xDEB887 });
                landmark = new THREE.Mesh(geometry, material);
                landmark.position.set(x, y, z);
                break;

            case 'volcano':
                geometry = new THREE.ConeGeometry(40, 80, 12);
                material = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
                landmark = new THREE.Mesh(geometry, material);
                landmark.position.set(x, y + 40, z);
                break;

            case 'dense_forest':
                // Create multiple trees
                const treeGroup = new THREE.Group();
                for (let i = 0; i < 20; i++) {
                    const treeX = x + (Math.random() - 0.5) * 60;
                    const treeZ = z + (Math.random() - 0.5) * 60;
                    const tree = this.createTree();
                    tree.position.set(treeX, y, treeZ);
                    treeGroup.add(tree);
                }
                landmark = treeGroup;
                break;

            case 'wall':
                geometry = new THREE.BoxGeometry(200, 15, 5);
                material = new THREE.MeshStandardMaterial({ color: 0x696969 });
                landmark = new THREE.Mesh(geometry, material);
                landmark.position.set(x, y + 7.5, z);
                break;

            case 'waterfall':
                geometry = new THREE.PlaneGeometry(20, 60);
                material = new THREE.MeshBasicMaterial({ 
                    color: 0x87CEEB, 
                    transparent: true, 
                    opacity: 0.7 
                });
                landmark = new THREE.Mesh(geometry, material);
                landmark.position.set(x, y + 30, z);
                break;

            case 'white_buildings':
                const buildingGroup = new THREE.Group();
                for (let i = 0; i < 10; i++) {
                    const building = this.createBuilding(0xFFFFFF);
                    building.position.set(
                        x + (Math.random() - 0.5) * 50,
                        y,
                        z + (Math.random() - 0.5) * 50
                    );
                    buildingGroup.add(building);
                }
                landmark = buildingGroup;
                break;

            case 'research_station':
                geometry = new THREE.BoxGeometry(40, 10, 25);
                material = new THREE.MeshStandardMaterial({ color: 0xFF6347 });
                landmark = new THREE.Mesh(geometry, material);
                landmark.position.set(x, y + 5, z);
                break;

            default:
                return null;
        }

        if (landmark) {
            landmark.castShadow = true;
            landmark.receiveShadow = true;
        }

        return landmark;
    }

    createTree() {
        const treeGroup = new THREE.Group();

        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(1, 2, 12, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 6;
        treeGroup.add(trunk);

        // Leaves
        const leavesGeometry = new THREE.SphereGeometry(8, 12, 12);
        const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 16;
        treeGroup.add(leaves);

        treeGroup.castShadow = true;
        treeGroup.receiveShadow = true;

        return treeGroup;
    }

    createBuilding(color = 0xFFFFFF) {
        const height = 10 + Math.random() * 20;
        const geometry = new THREE.BoxGeometry(8 + Math.random() * 4, height, 8 + Math.random() * 4);
        const material = new THREE.MeshStandardMaterial({ color: color });
        const building = new THREE.Mesh(geometry, material);
        building.position.y = height / 2;
        building.castShadow = true;
        building.receiveShadow = true;
        return building;
    }

    positionCamera(locationData) {
        // Position camera at a good starting point
        const startX = (Math.random() - 0.5) * 100;
        const startZ = (Math.random() - 0.5) * 100;
        const startY = this.getTerrainHeight(startX, startZ, locationData.biome) + 5;

        this.camera.position.set(startX, startY, startZ);
        this.camera.lookAt(0, startY, 0);
    }

    clearWorld() {
        // Remove existing terrain and landmarks
        if (this.terrain) {
            this.scene.remove(this.terrain);
            this.terrain.geometry.dispose();
            this.terrain.material.dispose();
        }

        if (this.skybox) {
            this.scene.remove(this.skybox);
            this.skybox.geometry.dispose();
            this.skybox.material.dispose();
        }

        this.landmarks.forEach(landmark => {
            this.scene.remove(landmark);
            if (landmark.geometry) landmark.geometry.dispose();
            if (landmark.material) landmark.material.dispose();
        });

        this.landmarks = [];
    }

    // Get terrain height at specific world coordinates
    getHeightAtPosition(x, z) {
        if (!this.terrain) return 0;
        return this.getTerrainHeight(x, z, this.currentLocation?.biome || 'default');
    }

    handleResize() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    // Get camera reference for player controller
    getCamera() {
        return this.camera;
    }

    // Get scene reference
    getScene() {
        return this.scene;
    }
}

// Export WorldGenerator
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorldGenerator;
}