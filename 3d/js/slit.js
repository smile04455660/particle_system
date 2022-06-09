import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export { SlitSystem };

class Emitter {
    constructor(position, speed, rand_range) {
        this.position = position;
        this.speed = speed;
        this.rand_range = rand_range;
    }

    emit() {
        const rand_a = Math.random() * 2 * Math.PI;
        const rand_r = THREE.MathUtils.randFloatSpread(this.rand_range);
        const rand_x = Math.cos(rand_a) * rand_r;
        const rand_y = Math.sin(rand_a) * rand_r;
        const speed = new THREE.Vector3(rand_x, rand_y).add(this.speed);
        const position = new THREE.Vector3().copy(this.position);
        return { speed, position };
    }
}

class SlitSystem {
    constructor() {
        const { scene, renderer, camera } = this.initApp();
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;
        this.total_particles = 5000;
        this.processed_particles = 0;
        this.lambda = 0.08;
        this.initScene();
        this.initPoints();
    }

    initApp() {
        const scene = new THREE.Scene();
        const renderer = new THREE.WebGLRenderer();

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 1.0);
        renderer.shadowMap.enable = true;

        document.body.appendChild(renderer.domElement);

        const camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.1,
            2000
        );

        camera.position.set(7.9, 6.7, 13);
        const cameraControl = new OrbitControls(camera, renderer.domElement);
        cameraControl.target = new THREE.Vector3(0, 0, -40);
        cameraControl.update();

        window.addEventListener("resize", function () {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        return { scene, renderer, camera };
    }

    initScene() {
        const w = 0.5;
        const plane_width = 5;
        const D = 40;
        this.w = w;
        this.D = D;
        this.slit_w = 0.5;
        const full_width = w + plane_width;
        const material = new THREE.MeshBasicMaterial({
            color: 0x9e9e9e,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.1,
        });
        for (let i = 0; i < 2; i++) {
            const x =
                (i === 0 ? -1 : 1) *
                (this.w / 2 + this.slit_w + plane_width / 2);
            const geometry = new THREE.BoxGeometry(
                plane_width,
                plane_width,
                0.1
            );
            const plane = new THREE.Mesh(geometry, material);
            const name = "box" + i;
            plane.position.setX(x);
            this[name] = plane;
            this.scene.add(plane);
        }
        for (let i = 0; i < 1; i++) {
            const geometry = new THREE.BoxGeometry(this.w, plane_width, 0.1);
            const plane = new THREE.Mesh(geometry, material);
            this["midbox"] = plane;
            this.scene.add(plane);
        }
        this.back_width = full_width * 10;
        const geometry = new THREE.BoxGeometry(
            this.back_width,
            plane_width * 5
        );
        const plane = new THREE.Mesh(geometry, material);
        plane.position.setZ(-D);
        // plane.updateMatrixWorld(true);
        // plane.geometry.computeBoundingBox();
        // this.backbox_bounding_box = new THREE.Box3();
        // this.backbox_bounding_box
        //     .copy(plane.geometry.boundingBox)
        //     .applyMatrix4(plane.matrixWorld);
        const name = "backbox";
        this[name] = plane;
        this.scene.add(plane);
    }

    initPoints() {
        this.emitter = new Emitter(
            new THREE.Vector3(0, 0, 20),
            new THREE.Vector3(0, 0, -0.5),
            0.05
        );
        this.point_radius = 0.5;

        const geometry = new THREE.BufferGeometry();
        const { x, y, z } = this.emitter.position;
        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
                new Float32Array(
                    Array(this.total_particles)
                        .fill([x, y, z])
                        .reduce((a, b) => a.concat(b))
                ),
                3
            )
        );
        geometry.setAttribute(
            "speed",
            new THREE.BufferAttribute(
                new Float32Array(this.total_particles * 3),
                3
            )
        );
        const texture = new THREE.TextureLoader().load("assets/dot.png");
        const material = new THREE.PointsMaterial({
            size: this.point_radius * 2,
            map: texture,
            depthTest: true,
            alphaTest: true,
            sizeAttenuation: true,
        });
        const points = new THREE.Points(geometry, material);
        points.frustumCulled = false;
        this["points"] = points;

        const hit_geometry = new THREE.BufferGeometry();
        hit_geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array([]), 3)
        );
        const hit_material = new THREE.PointsMaterial({
            size: this.point_radius * 2,
            map: texture,
            depthTest: true,
            alphaTest: true,
            sizeAttenuation: true,
            color: 0xff0000,
        });
        const hit_points = new THREE.Points(hit_geometry, hit_material);
        this["hit_points"] = hit_points;

        this.scene.add(points);

        this.t = 0;
    }

    _collideBack(position) {
        const { backbox } = this;
        // const sphere = new THREE.Sphere(
        //     new THREE.Vector3(position.x, position.y, position.z),
        //     this.point_radius
        // );
        // return sphere.intersectsBox(this.backbox_bounding_box);
        const depth = backbox.geometry.parameters.depth;
        return position.z + this.point_radius <= backbox.position.z - depth / 2;
        // console.log(backbox.geometry.parameters.depth)
    }

    _collideFront(position) {
        const { x, y, z } = position;
        const left = x <= -this.w / 2 - this.slit_w;
        const right = x >= this.w / 2 + this.slit_w;
        const mid = Math.abs(x) < this.w;
        return this._atSlit(position) && (left || mid || right);
    }

    _atSlit(position) {
        const { z } = position;
        const epsilon = 0.01;
        if (z > 0) return false;
        return -z < epsilon;
    }

    _apply2Slit(position, speed) {
        const { x, z } = position;
        let deltaX = (this.D * this.lambda) / this.w;
        let halfDX = deltaX / 2;
        let halfN = Math.floor(this.back_width / 2 / halfDX);
        let possN = Math.floor((halfN + 1) / 2);
        let i = Math.floor(Math.random() * possN);
        let tar_x =
            (Math.random() > 0.5 ? 1 : -1) *
            (i * 2 + 1 + THREE.MathUtils.randFloatSpread(0.5)) *
            halfDX;
        const o_v = new THREE.Vector3(speed.vx, speed.vy, speed.vz);
        const o_vl = o_v.length();
        const dire = new THREE.Vector3(tar_x - x, 0, -this.D);
        dire.normalize().multiplyScalar(o_vl);

        return dire;
    }

    pointsUpdate() {
        const { points, hit_points, backbox } = this;
        const { geometry } = points;
        const { attributes } = geometry;
        const { position, speed } = attributes;
        const position_a = Array.from(position.array);
        const speed_a = Array.from(speed.array);
        const hit_position = hit_points.geometry.attributes.position;
        const hit_position_a = hit_position.array;

        for (
            let i = position_a.length - 3, count = 0;
            i >= 0 && count <= this.processed_particles;
            i -= 3, count++
        ) {
            let x;
            let y;
            let z;
            let vx;
            let vy;
            let vz;

            if (count === this.processed_particles) {
                const { speed, position } = this.emitter.emit();
                x = position.x;
                y = position.y;
                z = position.z;

                vx = speed.x;
                vy = speed.y;
                vz = speed.z;
            } else {
                x = position_a[i];
                y = position_a[i + 1];
                z = position_a[i + 2];

                vx = speed_a[i];
                vy = speed_a[i + 1];
                vz = speed_a[i + 2];
            }

            x += vx;
            y += vy;
            z += vz;

            if (this._atSlit({ x, y, z })) {
                const additionalSpeed = this._apply2Slit(
                    { x, y, z },
                    { vx, vy, vz }
                );
                vx = additionalSpeed.x;
            }
            const collideFront = this._collideFront({ x, y, z });
            const collideBack = this._collideBack({ x, y, z });

            if (collideBack || collideFront) {
                const depth = backbox.geometry.parameters.depth;
                if (collideFront) position_a[i + 1] = 9999;
                position_a[i + 2] = -this.D + depth / 2;
                vx = vy = vz = 0;
            } else {
                position_a[i] = x;
                position_a[i + 1] = y;
                position_a[i + 2] = z;
            }

            speed_a[i] = vx;
            speed_a[i + 1] = vy;
            speed_a[i + 2] = vz;
        }
        position.array.set(position_a, 0);
        speed.array.set(speed_a, 0);
        position.needsUpdate = true;
        speed.needsUpdate = true;
        this.processed_particles++;
    }

    animate(scene, camera, renderer) {
        requestAnimationFrame(() => {
            this.animate(scene, camera, renderer);
        });
        this.pointsUpdate();
        renderer.render(scene, camera, renderer);
    }

    run() {
        this.animate(this.scene, this.camera, this.renderer);
    }
}

function sleep(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}
