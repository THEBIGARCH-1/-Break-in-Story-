window.addEventListener('load', () => {

    // --- 1. THREE.JS SCENE & BRIGHT LIGHTING SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a24); // Dark blue gray (Not pure black)

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('game-container').appendChild(renderer.domElement);

    // BRIGHT LIGHTING - Fixes Black Screen Issue
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2); // Bright room light
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const colliders = [];
    const interactables = [];

    // Helper: Build Textured Boxes
    function buildBox(x, y, z, w, h, d, color, hasCollision = true) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.5 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        scene.add(mesh);

        if (hasCollision) {
            const box = new THREE.Box3().setFromObject(mesh);
            colliders.push(box);
        }
        return mesh;
    }

    // --- 2. DUNGEON TUTORIAL ROOM (Spawn at Z = 50) ---
    buildBox(0, -0.1, 50, 14, 0.2, 14, 0x3a3a4a, false); // Floor
    buildBox(0, 4.1, 50, 14, 0.2, 14, 0x22222e, false);  // Ceiling

    buildBox(0, 2, 57, 14, 4, 0.6, 0x4a4a5a);   // Back Wall
    buildBox(-7, 2, 50, 0.6, 4, 14, 0x4a4a5a);  // Left Wall
    buildBox(7, 2, 50, 0.6, 4, 14, 0x4a4a5a);   // Right Wall
    buildBox(-4.2, 2, 43, 5.6, 4, 0.6, 0x4a4a5a); // Front Wall Left
    buildBox(4.2, 2, 43, 5.6, 4, 0.6, 0x4a4a5a);  // Front Wall Right

    // Exit Door
    const transitionDoor = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 3.6, 0.3),
        new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
    );
    transitionDoor.position.set(0, 1.8, 43);
    transitionDoor.name = "exit_door";
    scene.add(transitionDoor);
    interactables.push(transitionDoor);

    // Police Officer NPC
    const policeGroup = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 1.2, 16), new THREE.MeshStandardMaterial({ color: 0x1e88e5 }));
    body.position.y = 0.6;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 16), new THREE.MeshStandardMaterial({ color: 0xffcc99 }));
    head.position.y = 1.4;
    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.3, 0.16, 16), new THREE.MeshStandardMaterial({ color: 0x0d47a1 }));
    hat.position.y = 1.66;

    policeGroup.add(body, head, hat);
    policeGroup.position.set(0, 0, 52);
    policeGroup.name = "police_npc";
    scene.add(policeGroup);
    interactables.push(body, head, hat);

    // --- 3. TWO-STORY HOUSE (Z = -10 to 10) ---
    buildBox(0, -0.1, 0, 24, 0.2, 20, 0x555555, false); // Ground Floor
    buildBox(0, 4, 0, 24, 0.2, 20, 0x6d4c41, false);  // 2nd Floor

    buildBox(-12, 4, 0, 0.6, 8, 20, 0x455a64); 
    buildBox(12, 4, 0, 0.6, 8, 20, 0x455a64);  
    buildBox(0, 4, -10, 24, 8, 0.6, 0x455a64); 
    buildBox(0, 4, 10, 24, 8, 0.6, 0x455a64);  

    for (let i = 0; i < 10; i++) {
        buildBox(9, i * 0.4, 8 - (i * 0.8), 3, 0.4, 0.8, 0x8d6e63);
    }

    buildBox(-7, 0.5, -4, 4, 1, 2, 0xab47bc); // Couch
    buildBox(-7, 0.4, -1, 2.5, 0.6, 1.5, 0x5d4037); // Table

    // --- 4. 3D ITEMS ON FLOOR ---
    // Sword
    const swordGroup = new THREE.Group();
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.95, 0.02), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x222222 }));
    const hilt = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.05, 0.06), new THREE.MeshStandardMaterial({ color: 0xffd700 }));
    blade.position.y = 0.48;
    swordGroup.add(blade, hilt);
    swordGroup.rotation.z = Math.PI / 2;
    swordGroup.position.set(-3.5, 0.2, 50);
    swordGroup.name = "item_sword";
    scene.add(swordGroup);
    interactables.push(blade, hilt);

    // Crate
    const crateMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.85, 0.85),
        new THREE.MeshStandardMaterial({ color: 0xd7ccc8 })
    );
    crateMesh.position.set(3.5, 0.42, 50);
    crateMesh.name = "item_crate";
    scene.add(crateMesh);
    interactables.push(crateMesh);

    // Phone
    const phoneMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.26, 0.02, 0.48),
        new THREE.MeshStandardMaterial({ color: 0x212121 })
    );
    phoneMesh.position.set(-7, 0.72, -1);
    phoneMesh.name = "item_phone";
    scene.add(phoneMesh);
    interactables.push(phoneMesh);

    // --- 5. DIALOGUE & INVENTORY ---
    const policeLines = [
        "Officer: Welcome recruit! Walk around with WASD and turn with your mouse.",
        "Officer: Look at the Sword or Crate on the floor and press E to grab them.",
        "Officer: Once you grab them, press keys 1, 2, or 3 to select them in your bottom inventory!",
        "Officer: Head through the wooden door behind me to exit into the house!"
    ];
    let lineIdx = 0;

    const inventory = {
        1: { name: "item_sword", collected: false, equipped: false },
        2: { name: "item_crate", collected: false, equipped: false },
        3: { name: "item_phone", collected: false, equipped: false }
    };

    // --- 6. PLAYER MOVEMENT & CAMERA ---
    let isLocked = false;
    let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
    let isSprinting = false;

    let stamina = 100;
    const cameraRotation = { yaw: 0, pitch: 0 };
    const playerRadius = 0.4;

    camera.position.set(0, 1.6, 48);

    document.body.addEventListener('click', (e) => {
        if (e.target.closest('.slot')) return;
        document.body.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
        isLocked = document.pointerLockElement === document.body;
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
            case 'KeyE': interact(); break;
            case 'Digit1': toggleEquipSlot(1); break;
            case 'Digit2': toggleEquipSlot(2); break;
            case 'Digit3': toggleEquipSlot(3); break;
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

    document.querySelectorAll('.slot').forEach(slotBtn => {
        slotBtn.addEventListener('click', () => {
            const slotNum = slotBtn.getAttribute('data-slot');
            toggleEquipSlot(slotNum);
        });
    });

    function toggleEquipSlot(slotNum) {
        const item = inventory[slotNum];
        if (!item || !item.collected) return;

        for (let key in inventory) {
            inventory[key].equipped = (key == slotNum) ? !inventory[key].equipped : false;
        }

        document.querySelectorAll('.slot').forEach(btn => btn.classList.remove('active'));
        if (inventory[slotNum].equipped) {
            document.getElementById(`slot-${item.name.replace('item_', '')}`).classList.add('active');
        }
    }

    // --- 7. RAYCASTING ---
    const raycaster = new THREE.Raycaster();
    const centerVector = new THREE.Vector2(0, 0);
    let hoveredMesh = null;

    function checkRaycast() {
        raycaster.setFromCamera(centerVector, camera);
        const intersects = raycaster.intersectObjects(interactables, true);

        const prompt = document.getElementById('interaction-prompt');
        const promptText = document.getElementById('prompt-text');

        if (intersects.length > 0 && intersects[0].distance < 3.5) {
            hoveredMesh = intersects[0].object;
            prompt.style.display = 'block';

            let rootName = hoveredMesh.name || (hoveredMesh.parent ? hoveredMesh.parent.name : "");

            if (rootName === "police_npc") promptText.textContent = "Talk to Police Officer";
            else if (rootName === "exit_door") promptText.textContent = "Enter House";
            else if (rootName.startsWith("item_")) promptText.textContent = "Pick Up Object";
        } else {
            hoveredMesh = null;
            prompt.style.display = 'none';
        }
    }

    function interact() {
        if (!hoveredMesh) return;

        let root = hoveredMesh;
        while (root.parent && root.parent !== scene) root = root.parent;
        let targetName = root.name;

        if (targetName === "police_npc") {
            lineIdx = (lineIdx + 1) % policeLines.length;
            document.getElementById('dialogue-text').textContent = policeLines[lineIdx];
        } else if (targetName === "exit_door") {
            camera.position.set(0, 1.6, 8);
            cameraRotation.yaw = Math.PI;
            document.getElementById('dialogue-box').style.display = 'none';
        } else if (targetName.startsWith("item_")) {
            scene.remove(root);

            if (targetName === "item_sword") {
                inventory[1].collected = true;
                document.getElementById('slot-sword').classList.add('collected');
            } else if (targetName === "item_crate") {
                inventory[2].collected = true;
                document.getElementById('slot-crate').classList.add('collected');
            } else if (targetName === "item_phone") {
                inventory[3].collected = true;
                document.getElementById('slot-phone').classList.add('collected');
            }

            document.getElementById('interaction-prompt').style.display = 'none';
        }
    }

    function checkCollisions(newPos) {
        const playerBox = new THREE.Box3(
            new THREE.Vector3(newPos.x - playerRadius, newPos.y - 1.5, newPos.z - playerRadius),
            new THREE.Vector3(newPos.x + playerRadius, newPos.y + 0.3, newPos.z + playerRadius)
        );

        for (let collider of colliders) {
            if (playerBox.intersectsBox(collider)) return true;
        }
        return false;
    }

    // --- 8. RENDER LOOP ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();

        if (isLocked) {
            const staminaBar = document.getElementById('stamina-bar');

            if (isSprinting && (moveForward || moveBackward || moveLeft || moveRight) && stamina > 0) {
                stamina -= 35 * delta;
            } else if (stamina < 100 && !isSprinting) {
                stamina += 22 * delta;
            }
            staminaBar.style.width = `${Math.max(0, Math.min(100, stamina))}%`;

            let speed = (isSprinting && stamina > 0) ? 8.0 : 4.0;

            const moveDir = new THREE.Vector3();
            if (moveForward) moveDir.z -= 1;
            if (moveBackward) moveDir.z += 1;
            if (moveLeft) moveDir.x -= 1;
            if (moveRight) moveDir.x += 1;

            moveDir.normalize();
            moveDir.applyQuaternion(camera.quaternion);
            moveDir.y = 0;

            const targetPosX = camera.position.clone().addScaledVector(new THREE.Vector3(moveDir.x, 0, 0), speed * delta);
            if (!checkCollisions(targetPosX)) camera.position.x = targetPosX.x;

            const targetPosZ = camera.position.clone().addScaledVector(new THREE.Vector3(0, 0, moveDir.z), speed * delta);
            if (!checkCollisions(targetPosZ)) camera.position.z = targetPosZ.z;

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
