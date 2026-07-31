window.addEventListener('load', () => {

    // --- 1. THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0d14);
    scene.fog = new THREE.FogExp2(0x0c0d14, 0.03);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('game-container').appendChild(renderer.domElement);

    // Ambient & Flashlight
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    const flashlight = new THREE.SpotLight(0xffffff, 2.5, 22, Math.PI / 4, 0.5);
    camera.add(flashlight);
    flashlight.position.set(0, 0, 1);
    flashlight.target = camera;
    scene.add(camera);

    // --- 2. WORLD BUILDER & COLLISION SYSTEM ---
    const colliders = [];
    const pickableItems = [];

    function buildBox(x, y, z, w, h, d, color, hasCollision = true) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.7 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        scene.add(mesh);

        if (hasCollision) {
            const box = new THREE.Box3().setFromObject(mesh);
            colliders.push(box);
        }
        return mesh;
    }

    // A. TUTORIAL ROOM (Spawn area at Z = 30)
    buildBox(0, -0.1, 30, 16, 0.2, 16, 0x222233, false); // Floor
    buildBox(0, 2.5, 38, 16, 5, 0.5, 0x1e222d); // Back Wall
    buildBox(-8, 2.5, 30, 0.5, 5, 16, 0x1e222d); // Left Wall
    buildBox(8, 2.5, 30, 0.5, 5, 16, 0x1e222d); // Right Wall
    buildBox(-5, 2.5, 22, 6, 5, 0.5, 0x1e222d);  // Front Wall Left
    buildBox(5, 2.5, 22, 6, 5, 0.5, 0x1e222d);   // Front Wall Right (Door archway in center)

    // Tutorial NPC Guide
    const npcMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 1.8, 16),
        new THREE.MeshStandardMaterial({ color: 0x2196f3, emissive: 0x0d47a1 })
    );
    npcMesh.position.set(0, 0.9, 27);
    npcMesh.name = "npc";
    scene.add(npcMesh);

    // B. MAIN 2-STORY HOUSE (Z = -10 to 10)
    // Floors
    buildBox(0, -0.1, 0, 24, 0.2, 20, 0x2b2b2b, false); // Ground Floor
    buildBox(0, 4, 0, 24, 0.2, 20, 0x3e2723, false);  // 2nd Floor Floorboard

    // Outer Walls
    buildBox(-12, 4, 0, 0.5, 8, 20, 0x37474f); // Left
    buildBox(12, 4, 0, 0.5, 8, 20, 0x37474f);  // Right
    buildBox(0, 4, -10, 24, 8, 0.5, 0x37474f); // Back
    buildBox(0, 4, 10, 24, 8, 0.5, 0x37474f);  // Front

    // Stairs to Upstairs (Ramp Steps)
    for (let i = 0; i < 10; i++) {
        buildBox(9, i * 0.4, 8 - (i * 0.8), 3, 0.4, 0.8, 0x4e342e);
    }

    // Downstairs Interior Wall (Living Room | Kitchen)
    buildBox(-2, 2, 0, 0.5, 4, 20, 0x263238);

    // Upstairs Interior Walls (2 Bedrooms | Bathroom)
    buildBox(0, 6, 0, 0.5, 4, 20, 0x263238); // Split Left/Right
    buildBox(-6, 6, 0, 12, 4, 0.5, 0x263238); // Split Bedrooms

    // --- 3. FURNITURE & LOOT LOCATIONS ---

    // Lounge Room (Downstairs Left)
    buildBox(-7, 0.5, -4, 4, 1, 2, 0x7b1fa2); // Couch
    buildBox(-7, 0.4, -8, 3, 0.8, 1, 0x111111); // TV

    // Kitchen (Downstairs Right)
    buildBox(6, 0.6, -7, 6, 1.2, 2, 0xc2c2c2); // Counter
    buildBox(10, 1.5, -7, 2, 3, 2, 0x9e9e9e); // Fridge

    // Bedroom 1 (Upstairs Left-Back)
    buildBox(-7, 4.6, -6, 3.5, 1, 4, 0x303f9f); // Bed

    // Bedroom 2 (Upstairs Left-Front)
    buildBox(-7, 4.6, 5, 3.5, 1, 4, 0xc2185b); // Bed

    // Bathroom (Upstairs Right-Back)
    buildBox(6, 4.5, -6, 2.5, 1, 3, 0xe0e0e0); // Tub

    // Spawn 4 Loot Cubes across the 4 Rooms
    function spawnLoot(x, y, z) {
        const item = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 0.35, 0.35),
            new THREE.MeshStandardMaterial({ color: 0x00e676, emissive: 0x005522 })
        );
        item.position.set(x, y, z);
        item.name = "loot";
        scene.add(item);
        pickableItems.push(item);
    }

    spawnLoot(-7, 1.1, -4); // Lounge Couch
    spawnLoot(6, 1.4, -7);  // Kitchen Counter
    spawnLoot(-7, 5.3, -6); // Bedroom 1
    spawnLoot(-7, 5.3, 5);  // Bedroom 2

    // --- 4. CONTROLS, STAMINA & MOVEMENT ---

    let isLocked = false;
    let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
    let isSprinting = false;

    let stamina = 100;
    const maxStamina = 100;
    const cameraRotation = { yaw: 0, pitch: 0 };
    const playerRadius = 0.5;

    // Camera Spawn in Tutorial Room
    camera.position.set(0, 1.6, 32);

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
        cameraRotation.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, cameraRotation.pitch));

        const euler = new THREE.Euler(0, 0, 0, 'YXZ');
        euler.x = cameraRotation.pitch;
        euler.y = cameraRotation.yaw;
        camera.quaternion.setFromEuler(euler);
    });

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

    // --- 5. RAYCASTING INTERACTION ---

    const raycaster = new THREE.Raycaster();
    const centerVector = new THREE.Vector2(0, 0);
    let hoveredObject = null;
    let lootCollected = 0;

    function checkRaycast() {
        raycaster.setFromCamera(centerVector, camera);
        const intersects = raycaster.intersectObjects([...pickableItems, npcMesh]);

        const prompt = document.getElementById('interaction-prompt');

        if (intersects.length > 0 && intersects[0].distance < 3.5) {
            hoveredObject = intersects[0].object;
            prompt.style.display = 'block';

            if (hoveredObject.name === "npc") {
                prompt.innerHTML = "Press <span class='key'>E</span> to Talk to Guide";
            } else {
                prompt.innerHTML = "Press <span class='key'>E</span> to Pick Up";
            }
        } else {
            hoveredObject = null;
            prompt.style.display = 'none';
        }
    }

    function interactWithObject() {
        if (!hoveredObject) return;

        if (hoveredObject.name === "npc") {
            const tutBox = document.getElementById('tutorial-box');
            tutBox.style.display = 'block';
            document.getElementById('tut-title').textContent = "GUIDE BOT";
            document.getElementById('tut-text').textContent = "Controls: Use WASD to walk, SHIFT to sprint (watch your stamina bar!), and E to pick up objects. Head through the doorway behind me into the 2-story house to collect all 4 items!";
        } else if (hoveredObject.name === "loot") {
            scene.remove(hoveredObject);

            const index = pickableItems.indexOf(hoveredObject);
            if (index > -1) pickableItems.splice(index, 1);

            hoveredObject = null;
            document.getElementById('interaction-prompt').style.display = 'none';

            lootCollected++;
            document.getElementById('loot-count').textContent = lootCollected;

            if (lootCollected === 4) {
                const tutBox = document.getElementById('tutorial-box');
                tutBox.style.display = 'block';
                document.getElementById('tut-title').textContent = "ALL ITEMS FOUND!";
                document.getElementById('tut-text').textContent = "Congratulations! You found all 4 hidden items across both floors.";
            }
        }
    }

    // Collision Check Helper
    function checkCollisions(newPos) {
        const playerBox = new THREE.Box3(
            new THREE.Vector3(newPos.x - playerRadius, newPos.y - 1.5, newPos.z - playerRadius),
            new THREE.Vector3(newPos.x + playerRadius, newPos.y + 0.3, newPos.z + playerRadius)
        );

        for (let collider of colliders) {
            if (playerBox.intersectsBox(collider)) {
                return true;
            }
        }
        return false;
    }

    // --- 6. GAME LOOP ---

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();

        if (isLocked) {
            // Stamina Management
            const staminaBar = document.getElementById('stamina-bar');

            if (isSprinting && (moveForward || moveBackward || moveLeft || moveRight) && stamina > 0) {
                stamina -= 35 * delta;
                if (stamina < 0) stamina = 0;
            } else if (stamina < maxStamina && !isSprinting) {
                stamina += 22 * delta;
                if (stamina > maxStamina) stamina = maxStamina;
            }

            staminaBar.style.width = `${stamina}%`;
            staminaBar.style.backgroundColor = stamina < 20 ? '#ff5252' : '#2196f3';

            // Movement Calculation
            let speed = (isSprinting && stamina > 0) ? 8.0 : 4.0;

            const moveDir = new THREE.Vector3();
            if (moveForward) moveDir.z -= 1;
            if (moveBackward) moveDir.z += 1;
            if (moveLeft) moveDir.x -= 1;
            if (moveRight) moveDir.x += 1;

            moveDir.normalize();
            moveDir.applyQuaternion(camera.quaternion);
            moveDir.y = 0;

            // X Movement Collision
            const targetPosX = camera.position.clone().addScaledVector(new THREE.Vector3(moveDir.x, 0, 0), speed * delta);
            if (!checkCollisions(targetPosX)) {
                camera.position.x = targetPosX.x;
            }

            // Z Movement Collision
            const targetPosZ = camera.position.clone().addScaledVector(new THREE.Vector3(0, 0, moveDir.z), speed * delta);
            if (!checkCollisions(targetPosZ)) {
                camera.position.z = targetPosZ.z;
            }

            // Stair Elevation Handling
            if (camera.position.x > 7 && camera.position.x < 11 && camera.position.z > -1 && camera.position.z < 9) {
                const stairHeight = (8 - camera.position.z) * 0.5;
                camera.position.y = Math.max(1.6, 1.6 + stairHeight);
            }

            checkRaycast();
        }

        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
});
