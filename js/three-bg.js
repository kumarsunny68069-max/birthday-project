// THREE.JS 3D SURPRISE BACKGROUND SCENE
class ThreeBgScene {
    constructor() {
        this.container = document.getElementById('webgl-bg');
        if (!this.container) return;

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        this.hearts = [];
        this.balloons = [];
        this.stars = [];
        
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;
        
        this.pointLight = null;
        
        this.init();
    }

    init() {
        // 1. Scene setup
        this.scene = new THREE.Scene();
        
        // 2. Camera setup (Perspective for depth)
        this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 100);
        this.camera.position.z = 15;
        this.camera.position.y = 0;

        // 3. Renderer setup (transparent background to blend with CSS gradient)
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.container,
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;

        // 4. Create Heart Shape for 3D extrusion
        const x = 0, y = 0;
        const heartShape = new THREE.Shape();
        heartShape.moveTo(x + 2.5, y + 2.5);
        heartShape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
        heartShape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
        heartShape.bezierCurveTo(x - 3, y + 5.5, x - 1, y + 7.7, x + 2.5, y + 9.5);
        heartShape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 5.5, x + 8, y + 3.5);
        heartShape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
        heartShape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);

        const extrudeSettings = {
            depth: 0.6,
            bevelEnabled: true,
            bevelSegments: 4,
            steps: 1,
            bevelSize: 0.25,
            bevelThickness: 0.25
        };

        const heartGeometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
        heartGeometry.center(); // Center geometry pivoting point
        heartGeometry.scale(0.12, 0.12, 0.12); // scale down to custom size

        // 5. Materials (Physical glassmorphic/jelly material)
        const colors = [0xff4f87, 0xff7fa9, 0xc586ff, 0x9ad9ff, 0xffd6e7];
        
        // Hearts Spawning
        const heartCount = 35;
        for (let i = 0; i < heartCount; i++) {
            const matColor = colors[Math.floor(Math.random() * colors.length)];
            
            const heartMaterial = new THREE.MeshPhysicalMaterial({
                color: matColor,
                roughness: 0.1,
                metalness: 0.05,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1,
                transmission: 0.45, // Semi-transparent glass refraction
                thickness: 0.8,
                transparent: true,
                opacity: 0.85,
                side: THREE.DoubleSide
            });
            
            const mesh = new THREE.Mesh(heartGeometry, heartMaterial);
            
            // Random positions in 3D volume
            mesh.position.x = (Math.random() - 0.5) * 28;
            mesh.position.y = (Math.random() - 0.5) * 22;
            mesh.position.z = (Math.random() - 0.5) * 12 - 2;
            
            // Random rotations
            mesh.rotation.x = Math.random() * Math.PI;
            mesh.rotation.y = Math.random() * Math.PI;
            mesh.rotation.z = Math.random() * Math.PI;
            
            // Random spin speeds
            mesh.userData = {
                spinX: (Math.random() - 0.5) * 0.015,
                spinY: (Math.random() - 0.5) * 0.015,
                spinZ: (Math.random() - 0.5) * 0.010,
                floatSpeed: Math.random() * 0.015 + 0.005,
                floatPhase: Math.random() * Math.PI * 2
            };
            
            this.scene.add(mesh);
            this.hearts.push(mesh);
        }

        // 6. Balloons Spawning (Soft glossy pastel balloons)
        const balloonGeometry = new THREE.SphereGeometry(1, 32, 32);
        balloonGeometry.scale(1, 1.25, 0.85); // Shape like a balloon
        
        const balloonCount = 12;
        for (let i = 0; i < balloonCount; i++) {
            const matColor = colors[Math.floor(Math.random() * colors.length)];
            const balloonMaterial = new THREE.MeshStandardMaterial({
                color: matColor,
                roughness: 0.15,
                metalness: 0.1,
                transparent: true,
                opacity: 0.75
            });
            
            const mesh = new THREE.Mesh(balloonGeometry, balloonMaterial);
            mesh.position.x = (Math.random() - 0.5) * 32;
            mesh.position.y = (Math.random() - 0.5) * 25 - 2;
            mesh.position.z = (Math.random() - 0.5) * 15 - 5;
            
            mesh.rotation.z = (Math.random() - 0.5) * 0.3;
            
            mesh.userData = {
                floatSpeed: Math.random() * 0.01 + 0.005,
                floatPhase: Math.random() * Math.PI * 2,
                bobFreq: Math.random() * 0.5 + 0.5
            };
            
            this.scene.add(mesh);
            this.balloons.push(mesh);
        }

        // 7. Twinkling Stars (Specular crystals)
        const starGeometry = new THREE.OctahedronGeometry(0.2, 0);
        const starMaterial = new THREE.MeshStandardMaterial({
            color: 0xfff9c4,
            roughness: 0.1,
            metalness: 0.8,
            emissive: 0xfff9c4,
            emissiveIntensity: 0.5
        });
        
        const starCount = 40;
        for (let i = 0; i < starCount; i++) {
            const mesh = new THREE.Mesh(starGeometry, starMaterial);
            mesh.position.x = (Math.random() - 0.5) * 35;
            mesh.position.y = (Math.random() - 0.5) * 25;
            mesh.position.z = (Math.random() - 0.5) * 16 - 6;
            
            mesh.userData = {
                twinkleSpeed: Math.random() * 2 + 1,
                phase: Math.random() * Math.PI
            };
            
            this.scene.add(mesh);
            this.stars.push(mesh);
        }

        // 8. Lights setup
        const ambientLight = new THREE.AmbientLight(0xd7e9ff, 0.7); // soft blue fill
        this.scene.add(ambientLight);
        
        const dirLight = new THREE.DirectionalLight(0xffb7d5, 1.2); // warm pink directional light
        dirLight.position.set(5, 10, 7);
        this.scene.add(dirLight);
        
        // Interactive light tracking mouse
        this.pointLight = new THREE.PointLight(0xffffff, 2.5, 20);
        this.pointLight.position.set(0, 0, 8);
        this.scene.add(this.pointLight);

        // Attach listeners
        window.addEventListener('resize', this.onResize.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        
        // Run tick animate loop
        this.animate(0);
    }

    onMouseMove(e) {
        // Convert to Normalized Device Coordinates (-1 to +1)
        this.targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
        this.targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(this.width, this.height);
    }

    animate(timestamp) {
        requestAnimationFrame(this.animate.bind(this));
        
        const time = timestamp * 0.001;

        // 1. Mouse Lerping (Smooth tracking)
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.08;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.08;
        
        // Interactive Light tracks cursor in 3D space
        this.pointLight.position.x = this.mouseX * 12;
        this.pointLight.position.y = this.mouseY * 8;

        // Subtle camera rotation based on cursor
        this.camera.position.x = this.mouseX * 1.5;
        this.camera.position.y = this.mouseY * 1.2;
        this.camera.lookAt(0, 0, 0);

        // 2. Animate 3D Hearts (spins and gentle vertical floats)
        this.hearts.forEach(heart => {
            heart.rotation.x += heart.userData.spinX;
            heart.rotation.y += heart.userData.spinY;
            heart.rotation.z += heart.userData.spinZ;
            
            // Floating bounce up and down
            heart.position.y += Math.sin(time * 0.8 + heart.userData.floatPhase) * heart.userData.floatSpeed * 0.5;
            heart.position.x += Math.cos(time * 0.5 + heart.userData.floatPhase) * 0.005;
        });

        // 3. Animate 3D Balloons (slower bobbing and drift)
        this.balloons.forEach(balloon => {
            balloon.position.y += Math.sin(time * balloon.userData.bobFreq + balloon.userData.floatPhase) * balloon.userData.floatSpeed * 0.7;
            balloon.rotation.z = Math.sin(time * 0.5 + balloon.userData.floatPhase) * 0.08;
        });

        // 4. Animate Twinkling Stars
        this.stars.forEach(star => {
            const scale = Math.sin(time * star.userData.twinkleSpeed + star.userData.phase) * 0.4 + 0.8;
            star.scale.set(scale, scale, scale);
            star.rotation.y += 0.01;
        });

        this.renderer.render(this.scene, this.camera);
    }
}

// Instantiate on window load
window.addEventListener('DOMContentLoaded', () => {
    // Inject Three.js script elements first to ensure the library is active
    if (typeof THREE !== 'undefined') {
        window.threeBgSceneInstance = new ThreeBgScene();
    }
});
