import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export { SnowflakeSystem };

class SnowflakeSystem {
    constructor() {
        const { scene, renderer, camera } = this.initApp();
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;
        this.createPoints(scene);
    }

    initApp() {
        const scene = new THREE.Scene();
        const renderer = new THREE.WebGLRenderer();

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 1.0);
        renderer.shadowMap.enable = true;

        document.body.appendChild(renderer.domElement);

        const camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(0, 0, 10);
        camera.lookAt(scene.position);

        scene.fog = new THREE.FogExp2(0x000000, 0.0025);

        window.addEventListener("resize", function () {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        const cameraControl = new OrbitControls(camera, renderer.domElement);

        return { scene, renderer, camera };
    }

    createPoints(scene) {
        const particleCount = 15000;
        const posRange = 500;
        const vertices = [];
        const speed = [];
        for (let i = 0; i < particleCount; i++) {
            const x = THREE.MathUtils.randFloatSpread(posRange);
            const y = THREE.MathUtils.randFloatSpread(posRange);
            const z = THREE.MathUtils.randFloatSpread(posRange);
            const vx = THREE.MathUtils.randFloatSpread(0.16);
            const vy = -THREE.MathUtils.randFloat(0.1, 0.3);
            const vz = THREE.MathUtils.randFloatSpread(0.32);
            vertices.push(x, y, z);
            speed.push(vx, vy, vz);
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(vertices), 3)
        );
        geometry.setAttribute(
            "speed",
            new THREE.BufferAttribute(new Float32Array(speed), 3)
        );
        const texture = new THREE.TextureLoader().load("assets/snowflake.png");
        const material = new THREE.PointsMaterial({
            size: 3,
            map: texture,
            blending: THREE.AdditiveBlending,
            depthTest: true,
            transparent: true,
            opacity: 0.7,
            sizeAttenuation: true,
        });
        const points = new THREE.Points(geometry, material);
        scene.add(points);
    }

    pointsUpdate(points) {
        const { geometry } = points;
        const { attributes } = geometry;
        const { position, speed } = attributes;
        for (let i = 0; i < position.array.length; i += 3) {
            let x = position.array[i];
            let y = position.array[i + 1];
            let z = position.array[i + 2];

            let vx = speed.array[i];
            let vy = speed.array[i + 1];
            let vz = speed.array[i + 2];

            x = x + vx;
            y = y + vy;
            z = z + vz;

            if (y <= -250) y = 250;
            if ((x <= -250 && vx < 0) || (x >= 250 && vx >= 0)) vx = vx * -1;
            if ((z <= -250 && vz < 0) || (z >= 250 && vz >= 0)) vz = vz * -1;

            position.array[i] = x;
            position.array[i + 1] = y;
            position.array[i + 2] = z;
            speed.array[i] = vx;
            speed.array[i + 2] = vz;
        }
        position.needsUpdate = true;
        speed.needsUpdate = true;
    }

    animate(scene, camera, renderer) {
        requestAnimationFrame(() => {
            this.animate(scene, camera, renderer);
        });
        const points = scene.children[0];
        this.pointsUpdate(points);
        renderer.render(scene, camera, renderer);
    }

    run() {
        this.animate(this.scene, this.camera, this.renderer);
    }
}
