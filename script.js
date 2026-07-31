window.addEventListener('load', () => {

    // --- 1. THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050508);
    scene.fog = new THREE.FogExp2(0x050508, 0.04);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('game-container').appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const flashlight = new THREE.SpotLight(0xffffff, 2.5, 22, Math.PI / 4, 0.5);
    camera.add(flashlight);
    flashlight.position.set(0, 0, 1);
    flashlight.target = camera;
    scene.add(camera);

    const colliders = [];
    const interactables = [];

    function buildBox(x, y, z, w, h, d, color, hasCollision = true) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 });
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
    buildBox(0, -0.1, 50, 12, 0.2, 12, 0x1f1f28, false); // Floor
    buildBox(0, 4.1, 50, 12, 0.2, 12, 0x15151e, false);  // Ceiling

    buildBox(0, 2, 56, 12, 4, 0.5, 0x2d2d3a);   // Back Wall
    buildBox(-6, 2, 50, 0.5, 4, 12, 0x2d2d3a);  // Left Wall
    buildBox(6, 2, 50, 0.5, 4, 12, 0x2d2d3a);   // Right Wall
    buildBox(-3.5, 2, 44, 5, 4, 0.5, 0x2d2d3a); // Front Wall Left
    buildBox(3.5, 2, 44, 5, 4, 0.5, 0x2d2d3a);  // Front Wall Right

    // Exit Door
    const transitionDoor = new THREE.Mesh(
        new THREE.BoxGeometry(2, 3.5, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x8b5a2b, emissive: 0x221100 })
    );
    transitionDoor.position.set(0, 1.75, 44);
    transitionDoor.name = "exit_door";
    scene.add(transitionDoor);
    interactables.push(transitionDoor);

    // Police Officer NPC
    const policeMesh = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.2, 16), new THREE.MeshStandardMaterial({ color: 0x0d47a1 }));
    body.position.y = 0.6;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), new THREE.MeshStandardMaterial({ color: 0xffcc99 }));
    head.position.y = 1.4;
    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.15, 16), new THREE.MeshStandardMaterial({ color: 0x000055 }));
    hat.position.y = 1.65;
    policeMesh.add(body, head, hat);
    policeMesh.position.set(0, 0, 52);
    policeMesh.name = "police_npc";
    scene.add(policeMesh);
    interactables.push(body, head, hat);

    // --- 3. MAIN TWO-STORY HOUSE (Z = -10 to 10) ---
    buildBox(0, -0.1, 0, 24, 0.2, 20, 0x222222, false); // Ground Floor
    buildBox(0, 4, 0, 24, 0.2, 20, 0x3e2723, false);  // 2nd Floor

    // House Walls
    buildBox(-12, 4, 0, 0.5, 8, 20, 0x37474f); 
    buildBox(12, 4, 0, 0.5, 8, 20, 0x37474f);  
    buildBox(0, 4, -10, 24, 8, 0.5, 0x37474f); 
    buildBox(0, 4, 10, 24, 8, 0.5, 0x37474f);  

    // Stairs
    for (let i = 0; i < 10; i++) {
        buildBox(9, i * 0.4, 8 - (i * 0.8), 3, 0.4, 0.8, 0x4e342e);
    }

    // Dividers & Furniture
    buildBox(-2, 2, 0, 0.5, 4, 20, 0x263238); // Downstairs split
    buildBox(0, 6, 0, 0.5, 4, 20, 0x263238);  // Upstairs split
    buildBox(-6, 6, 0, 12, 4, 0.5, 0x263238);

    const couch = buildBox(-7, 0.5, -4, 4, 1, 2, 0x7b1fa2); // Couch
    const table = buildBox(-7, 0.4, -1, 2.5, 0.6, 1.5, 0x4e342e); // Table

    // --- 4. 3D ITEMS ON THE GROUND ---

    // 1. SWORD (On Floor in Dungeon)
    const swordGroup = new THREE.Group();
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.02), new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.9, roughness: 0.2 }));
    const hilt = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.06), new THREE.MeshStandardMaterial({ color: 0xb8860b }));
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.25), new THREE.MeshStandardMaterial({ color: 0x4a2e1b }));
    blade.position.y = 0.45;
    handle.position.y = -0.12;
    swordGroup.add(blade, hilt, handle);
    swordGroup.rotation.z = Math.PI / 2; // Lie flat on floor
    swordGroup.position.set(-3.5, 0.1, 50);
    swordGroup.name = "item_sword";
    scene.add(swordGroup);
    interactables.push(blade, hilt, handle);

    // 2. CRATE (On Floor in Dungeon)
    const crateMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.8, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 })
    );
    crateMesh.position.set(3.5, 0.4, 50);
    crateMesh.name = "item_crate";
    scene.add(crateMesh);
    interactables.push(crateMesh);

    // 3. PHONE (On Table in House Living Room)
    const phoneMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.02, 0.45),
        new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1 })
    );
    phoneMesh.position.set(-7, 0.72, -1);
    phoneMesh.name = "item_phone";
    scene.add(phoneMesh);
    interactables.push(phoneMesh);

    // --- 5. DIALOGUE SYSTEM ---
    const policeLines = [
        "Officer: Welcome to training! Move around with WASD and turn with your mouse.",
        "Officer: Hold SHIFT to sprint. Look at objects on the ground and press E to grab them.",
        "Officer: Pick up the Sword and Crate off the dungeon floor right now!",
        "Officer: Once you have them, walk through the door behind me to enter the house!"
    ];
    let lineIdx = 0;

    // --- 6. CONTROLS & MOVEMENT ---
    let isLocked = false;
    let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
    let isSprinting = false;

    let stamina = 100;
    const maxStamina = 100;
    const cameraRotation = { yaw: 0, pitch: 0 };
    const playerRadius = 0.4;

    camera.position.set(0, 1.6, 48);

    document.body.addEventListener('click', () => {
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

    // --- 7. INTERACTION & INVENTORY SLOT FILLING ---
    const raycaster = new THREE.Raycaster();
    const centerVector = new THREE.Vector2(0, 0);
    let hoveredMesh = null;

    function checkRaycast() {
        raycaster.setFromCamera(centerVector, camera);
        const intersects = raycaster.intersectObjects(interactables, true);

        const prompt = document.getElementById('interaction-prompt');

        if (intersects.length > 0 && intersects[0].distance < 3.5) {
            hoveredMesh = intersects[0].object;
            prompt.style.display = 'block';

            let rootName = hoveredMesh.name || (hoveredMesh.parent ? hoveredMesh.parent.name : "");

            if (rootName === "police_npc") {
                prompt.innerHTML = "Press <span class='key'>E</span> to Talk to Officer";
            } else if (rootName === "exit_door") {
                prompt.innerHTML = "Press <span class='key'>E</span> to Enter House";
            } else if (rootName === "item_sword") {
                prompt.innerHTML = "Press <span class='key'>E</span> to Pick Up Sword";
            } else if (rootName === "item_crate") {
                prompt.innerHTML = "Press <span class='key'>E</span> to Pick Up Crate";
            } else if (rootName === "item_phone") {
                prompt.innerHTML = "Press <span class='key'>E</span> to Pick Up Phone";
            }
        } else {
            hoveredMesh = null;
            prompt.style.display = 'none';
        }
    }

    function interact() {
        if (!hoveredMesh) return;

        let root = hoveredMesh;
        while (root.parent && root.parent !== scene) {
            root = root.parent;
        }
        let targetName = root.name;

        if (targetName === "police_npc") {
            lineIdx = (lineIdx + 1) % policeLines.length;
            document.getElementById('dialogue-text').textContent = policeLines[lineIdx];
        } 
        else if (targetName === "exit_door") {
            triggerHouseTransition();
        } 
        else if (targetName.startsWith("item_")) {
            // Remove 3D Object from World Ground
            scene.remove(root);

            // Activate and Fill Empty Slot in Inventory HUD
            if (targetName === "item_sword") {
                document.getElementById('slot-sword').classList.add('collected');
            } else if (targetName === "item_crate") {
                document.getElementById('slot-crate').classList.add('collected');
            } else if (targetName === "item_phone") {
                document.getElementById('slot-phone').classList.add('collected');
            }

            document.getElementById('interaction-prompt').style.display = 'none';
        }
    }

    function triggerHouseTransition() {
        const overlay = document.getElementById('fade-overlay');
        overlay.classList.add('active');

        setTimeout(() => {
            camera.position.set(0, 1.6, 8);
            cameraRotation.yaw = Math.PI;
            document.getElementById('dialogue-box').style.display = 'none';

            setTimeout(() => {
                overlay.classList.remove('active');
            }, 500);
        }, 1000);
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

    // --- 8. GAME LOOP ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();

        if (isLocked) {
            const staminaBar = document.getElementById('stamina-bar');

            if (isSprinting && (moveForward || moveBackward || moveLeft || moveRight) && stamina > 0) {
                stamina -= 35 * delta;
                if (stamina < 0) stamina = 0;
            } else if (stamina < maxStamina && !isSprinting) {
                stamina += 22 * delta;
                if (stamina > maxStamina) stamina = maxStamina;
            }

            staminaBar.style.width = `${stamina}%`;

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
