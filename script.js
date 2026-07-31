// Ensure script initializes only after window loads
window.addEventListener('load', () => {

    // --- 1. THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a10);
    scene.fog = new THREE.FogExp2(0x0a0a10, 0.05);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('game-container').appendChild(renderer.domElement);

    // Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // Flashlight (Attached to Player Camera)
    const flashlight = new THREE.SpotLight(0xffffff, 2, 25, Math.PI / 5, 0.5);
    camera.add(flashlight);
    flashlight.position.set(0, 0, 1);
    flashlight.target = camera;
    scene.add(camera);

    // --- 2. MAP & ENVIRONMENT BUILDER ---

    // Floor
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Walls (House Interior)
    function createWall(x, z, w, d) {
        const wallGeo = new THREE.BoxGeometry(w, 4, d);
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x2e2e3e });
        const wall = new THREE.Mesh(wallGeo, wallMat);
        wall.position.set(x, 2, z);
        scene.add(wall);
    }

    createWall(0, -15, 30, 0.5); // Back Wall
    createWall(-15, 0, 0.5, 30); // Left Wall
    createWall(15, 0, 0.5, 30);  // Right Wall
    createWall(0, 15, 30, 0.5);  // Front Wall

    // Desk with Loot Item
    const desk = new THREE.Mesh(new THREE.BoxGeometry(3, 1.2, 1.8), new THREE.MeshStandardMaterial({ color: 0x3d2314 }));
    desk.position.set(0, 0.6, -10);
    scene.add(desk);

    // Pickable Loot Object (Glowing Keycard/Drive)
    const lootGeo = new THREE.BoxGeometry(0.3, 0.1, 0.4);
    const lootMat = new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0x880000 });
    const lootItem = new THREE.Mesh(lootGeo, lootMat);
    lootItem.position.set(0, 1.3, -10);
    lootItem.name = "loot";
    scene.add(lootItem);

    // --- 3. FIRST PERSON CONTROLS & STAMINA ---

    let isLocked = false;
    let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
    let isSprinting = false;

    // Stamina Variables
    let stamina = 100;
    const maxStamina = 100;
    const staminaDrain = 35; // Drain speed
    const staminaRegen = 20; // Recovery speed

    const cameraRotation = { yaw: 0, pitch: 0 };
    camera.position.set(0, 1.6, 10); // Player start height

    // Pointer Lock activation on click
    document.body.addEventListener('click', () => {
        document.body.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
        isLocked = document.pointerLockElement === document.body;
        if (isLocked) {
            document.getElementById('tutorial-box').style.display = 'none';
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (!isLocked) return;

        cameraRotation.yaw -= e.movementX * 0.002;
        cameraRotation.pitch -= e.movementY * 0.002;

        // Pitch clamp
        cameraRotation.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, cameraRotation.pitch));

        const euler = new THREE.Euler(0, 0, 0, 'YXZ');
        euler.x = cameraRotation.pitch;
        euler.y = cameraRotation.yaw;
        camera.quaternion.setFromEuler(euler);
    });

    // Keyboard Inputs
    window.addEventListener('keydown', (e) => {
        switch (e.code) {
            case 'KeyW': moveForward = true; break;
            case 'KeyS': moveBackward = true; break;
            case 'KeyA': moveLeft = true; break;
            case 'KeyD': moveRight = true; break;
            case 'ShiftLeft':
            case 'ShiftRight': isSprinting = true; break;
            case 'KeyE': interactWithObject(); break;
        }
    });

    window.addEventListener('keyup', (e) => {
        switch (e.code) {
            case 'KeyW': moveForward = false; break;
            case 'KeyS': moveBackward = false; break;
            case 'KeyA': moveLeft = false; break;
            case 'KeyD': moveRight = false; break;
            case 'ShiftLeft':
            case 'ShiftRight': isSprinting = false; break;
        }
    });

    // --- 4. RAYCASTING (OBJECT PICKUP WITH 'E') ---

    const raycaster = new THREE.Raycaster();
    const centerVector = new THREE.Vector2(0, 0);
    let hoveredObject = null;
    let lootCollected = 0;

    function checkRaycast() {
        raycaster.setFromCamera(centerVector, camera);
        const intersects = raycaster.intersectObjects([lootItem]);

        const prompt = document.getElementById('interaction-prompt');

        if (intersects.length > 0 && intersects[0].distance < 3.5) {
            hoveredObject = intersects[0].object;
            prompt.style.display = 'block';
        } else {
            hoveredObject = null;
            prompt.style.display = 'none';
        }
    }

    function interactWithObject() {
        if (hoveredObject && hoveredObject.name === "loot") {
            scene.remove(hoveredObject);
            hoveredObject = null;
            document.getElementById('interaction-prompt').style.display = 'none';

            lootCollected++;
            document.getElementById('loot-count').textContent = lootCollected;

            const tutBox = document.getElementById('tutorial-box');
            tutBox.style.display = 'block';
            document.getElementById('tut-title').textContent = "OBJECTIVE SECURED";
            document.getElementById('tut-text').textContent = "You retrieved the target item! Mission complete.";
        }
    }

    // --- 5. GAME LOOP ---

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();

        if (isLocked) {
            // Stamina Management
            const staminaBar = document.getElementById('stamina-bar');

            if (isSprinting && (moveForward || moveBackward || moveLeft || moveRight) && stamina > 0) {
                stamina -= staminaDrain * delta;
                if (stamina < 0) stamina = 0;
            } else if (stamina < maxStamina && !isSprinting) {
                stamina += staminaRegen * delta;
                if (stamina > maxStamina) stamina = maxStamina;
            }

            staminaBar.style.width = `${(stamina / maxStamina) * 100}%`;
            staminaBar.style.backgroundColor = stamina < 20 ? '#ff5252' : '#2196f3';

            // Movement Calculations
            let currentSpeed = 4.0; // Walk speed
            if (isSprinting && stamina > 0) {
                currentSpeed = 8.5; // Sprint speed
            }

            const moveDir = new THREE.Vector3();
            if (moveForward) moveDir.z -= 1;
            if (moveBackward) moveDir.z += 1;
            if (moveLeft) moveDir.x -= 1;
            if (moveRight) moveDir.x += 1;

            moveDir.normalize();
            moveDir.applyQuaternion(camera.quaternion);
            moveDir.y = 0; // Lock to ground plane

            camera.position.addScaledVector(moveDir, currentSpeed * delta);

            // Boundary collision
            camera.position.x = Math.max(-14, Math.min(14, camera.position.x));
            camera.position.z = Math.max(-14, Math.min(14, camera.position.z));

            checkRaycast();
        }

        renderer.render(scene, camera);
    }

    // Window Resize Handling
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
});
