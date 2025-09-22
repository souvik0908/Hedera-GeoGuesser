// Player Controller for 3D movement
class PlayerController {
    constructor(camera, worldGenerator, canvas) {
        this.camera = camera;
        this.worldGenerator = worldGenerator;
        this.canvas = canvas;
        
        // Movement state
        this.keys = {};
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.raycaster = new THREE.Raycaster();
        
        // Movement settings
        this.speed = 25; // Base movement speed
        this.runSpeed = 50; // Running speed
        this.jumpHeight = 15;
        this.gravity = -50;
        this.isOnGround = false;
        this.canJump = true;
        
        // Mouse look settings
        this.mouseSensitivity = 0.002;
        this.pitch = 0;
        this.yaw = 0;
        this.maxPitch = Math.PI / 2 - 0.1;
        
        // Distance tracking
        this.totalDistance = 0;
        this.lastPosition = new THREE.Vector3();
        this.lastPosition.copy(this.camera.position);
        
        // Pointer lock
        this.isPointerLocked = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPointerLock();
        
        // Start movement loop
        this.update = this.update.bind(this);
        this.startUpdateLoop();
    }

    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (event) => this.onKeyDown(event));
        document.addEventListener('keyup', (event) => this.onKeyUp(event));
        
        // Mouse events
        document.addEventListener('mousemove', (event) => this.onMouseMove(event));
        
        // Canvas click to enable pointer lock
        this.canvas.addEventListener('click', () => this.requestPointerLock());
        
        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', (event) => event.preventDefault());
    }

    setupPointerLock() {
        const element = document.body;
        
        // Pointer lock change event
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === element;
        });

        document.addEventListener('pointerlockerror', () => {
            console.error('Pointer lock error');
        });
    }

    requestPointerLock() {
        const element = document.body;
        if (element.requestPointerLock) {
            element.requestPointerLock();
        }
    }

    onKeyDown(event) {
        this.keys[event.code] = true;
        
        // Prevent default behavior for game keys
        if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ShiftLeft'].includes(event.code)) {
            event.preventDefault();
        }
    }

    onKeyUp(event) {
        this.keys[event.code] = false;
    }

    onMouseMove(event) {
        if (!this.isPointerLocked) return;

        const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        this.yaw -= movementX * this.mouseSensitivity;
        this.pitch -= movementY * this.mouseSensitivity;

        // Clamp pitch to prevent camera flipping
        this.pitch = Math.max(-this.maxPitch, Math.min(this.maxPitch, this.pitch));

        // Apply rotation to camera
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.yaw;
        this.camera.rotation.x = this.pitch;
    }

    update(deltaTime) {
        this.handleMovement(deltaTime);
        this.updateGroundDetection();
        this.updateDistanceTracking();
    }

    handleMovement(deltaTime) {
        const currentSpeed = this.keys['ShiftLeft'] ? this.runSpeed : this.speed;
        
        // Reset direction
        this.direction.set(0, 0, 0);
        
        // Forward/backward movement
        if (this.keys['KeyW']) {
            this.direction.add(this.camera.getWorldDirection(new THREE.Vector3()));
        }
        if (this.keys['KeyS']) {
            this.direction.add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(-1));
        }
        
        // Left/right movement
        if (this.keys['KeyA']) {
            const left = new THREE.Vector3();
            left.crossVectors(this.camera.up, this.camera.getWorldDirection(new THREE.Vector3()));
            this.direction.add(left);
        }
        if (this.keys['KeyD']) {
            const right = new THREE.Vector3();
            right.crossVectors(this.camera.getWorldDirection(new THREE.Vector3()), this.camera.up);
            this.direction.add(right);
        }

        // Normalize direction for consistent speed
        if (this.direction.length() > 0) {
            this.direction.normalize();
            
            // Apply horizontal movement
            this.velocity.x = this.direction.x * currentSpeed;
            this.velocity.z = this.direction.z * currentSpeed;
        } else {
            // Apply friction when not moving
            this.velocity.x *= 0.8;
            this.velocity.z *= 0.8;
        }

        // Jumping
        if (this.keys['Space'] && this.isOnGround && this.canJump) {
            this.velocity.y = this.jumpHeight;
            this.isOnGround = false;
            this.canJump = false;
            
            // Allow jumping again after a short delay
            setTimeout(() => {
                this.canJump = true;
            }, 500);
        }

        // Apply gravity
        this.velocity.y += this.gravity * deltaTime;

        // Apply velocity to camera position
        const movement = this.velocity.clone().multiplyScalar(deltaTime);
        this.camera.position.add(movement);

        // Ground collision
        const groundHeight = this.worldGenerator.getHeightAtPosition(
            this.camera.position.x, 
            this.camera.position.z
        ) + 2; // Player height offset

        if (this.camera.position.y <= groundHeight) {
            this.camera.position.y = groundHeight;
            this.velocity.y = 0;
            this.isOnGround = true;
        }

        // Boundary checking (keep player within reasonable bounds)
        const maxDistance = CONFIG.WORLD.TERRAIN_SIZE / 2 - 50;
        if (Math.abs(this.camera.position.x) > maxDistance) {
            this.camera.position.x = Math.sign(this.camera.position.x) * maxDistance;
        }
        if (Math.abs(this.camera.position.z) > maxDistance) {
            this.camera.position.z = Math.sign(this.camera.position.z) * maxDistance;
        }
    }

    updateGroundDetection() {
        // Cast ray downward to detect ground
        this.raycaster.set(
            this.camera.position,
            new THREE.Vector3(0, -1, 0)
        );

        const intersects = this.raycaster.intersectObjects(
            [this.worldGenerator.terrain].filter(obj => obj !== null)
        );

        this.isOnGround = intersects.length > 0 && intersects[0].distance < 3;
    }

    updateDistanceTracking() {
        // Calculate distance moved since last frame
        const currentPosition = this.camera.position.clone();
        const distance = currentPosition.distanceTo(this.lastPosition);
        
        // Only count horizontal movement
        const horizontalDistance = Math.sqrt(
            Math.pow(currentPosition.x - this.lastPosition.x, 2) +
            Math.pow(currentPosition.z - this.lastPosition.z, 2)
        );
        
        this.totalDistance += horizontalDistance;
        this.lastPosition.copy(currentPosition);
    }

    resetPosition(x, y, z) {
        this.camera.position.set(x, y, z);
        this.velocity.set(0, 0, 0);
        this.totalDistance = 0;
        this.lastPosition.copy(this.camera.position);
        
        // Reset camera rotation
        this.pitch = 0;
        this.yaw = 0;
        this.camera.rotation.set(0, 0, 0);
    }

    getDistanceTraveled() {
        return this.totalDistance;
    }

    getCurrentPosition() {
        return this.camera.position.clone();
    }

    startUpdateLoop() {
        let lastTime = performance.now();
        
        const animate = () => {
            requestAnimationFrame(animate);
            
            const currentTime = performance.now();
            const deltaTime = (currentTime - lastTime) / 1000;
            lastTime = currentTime;
            
            this.update(deltaTime);
        };
        
        animate();
    }

    // Enable/disable controls
    enable() {
        this.canvas.style.cursor = 'none';
    }

    disable() {
        this.canvas.style.cursor = 'default';
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    }

    // Get movement state for UI display
    getMovementState() {
        const isMoving = Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.z) > 0.1;
        const isRunning = this.keys['ShiftLeft'] && isMoving;
        const isJumping = this.velocity.y > 0.1;

        return {
            isMoving,
            isRunning,
            isJumping,
            isOnGround: this.isOnGround,
            speed: Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z),
            distanceTraveled: Math.round(this.totalDistance)
        };
    }
}

// Export PlayerController
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlayerController;
}