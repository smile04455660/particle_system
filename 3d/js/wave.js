import * as THREE from "three";
import { SkeletonHelper } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export { WaveSystem };

class WaveSystem {
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
            2000
        );

        camera.position.set(70, 40, -10);
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

    _fix(n) {
        return n > 0 ? Math.floor(n) : Math.ceil(n);
    }

    _linspace(x1, x2, n) {
        if (n === undefined) n = 100;
        if (n < 2) throw new Error("n must an integer greater than 1");
        const diff = (x2 - x1) / (n - 1);
        return Array(n)
            .fill(0)
            .map((v, i) => i * diff + x1);
    }

    _zeros(m, n) {
        let isValid = (v) => v !== undefined && Number.isInteger(v);
        if (!isValid(m) || !isValid(n)) throw new Error("input not valid");
        return Array(m).fill(Array(n).fill(0));
    }

    createPoints(scene) {
        this.t = 0;
        this.Lx = 100;
        this.Lz = 100;
        this.dx = 1;
        this.dz = 1;
        this.nx = this._fix(this.Lx / this.dx);
        this.nz = this._fix(this.Lz / this.dz);
        this.x = this._linspace(0, this.Lx, this.nx);
        this.z = this._linspace(0, this.Lz, this.nz);

        this.wn = this._zeros(this.nx, this.nz);
        this.wnm1 = this._zeros(this.nx, this.nz);
        this.wnp1 = this._zeros(this.nx, this.nz);

        this.CFL = 0.5;
        this.c = 1;
        this.dt = (this.CFL * this.dx) / this.c;

        const vertices = [];
        const z_start = -this.nz * this.dz;
        const y = 0;
        for (let j = 0; j < this.nz; j++) {
            const x_start = (-this.nx / 2 + 0.5) * this.dx;
            const z = z_start + j * this.dz;
            for (let i = 0; i < this.nx; i++) {
                if (j === 0 ||j === this.nz - 1 || i === 0 || i === this.nx - 1)
                    continue;
                const x = x_start + i * this.dx;
                vertices.push(x, y, z);
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(vertices), 3)
        );
        const texture = new THREE.TextureLoader().load("assets/dot.png");
        const material = new THREE.PointsMaterial({
            size: 2.5,
            map: texture,
            depthTest: true,
            alphaTest: true,
            sizeAttenuation: true,
        });
        const points = new THREE.Points(geometry, material);
        scene.add(points);
    }

    _copy(dest, sour) {
        for (let i = 0; i < dest.length; i++) {
            for (let j = 0; j < dest[0].length; j++) {
                dest[i][j] = sour[i][j];
            }
        }
    }

    pointsUpdate(points) {
        const { geometry } = points;
        const { attributes } = geometry;
        const { position } = attributes;

        this.t += this.dt;

        // save
        this._copy(this.wnm1, this.wn);
        this._copy(this.wn, this.wnp1);

        // source, nx and nz have to be even
        this.wn[this.nx / 2][this.nz / 2] =
            this.dt ** 2 * 20 * Math.sin((30 * Math.PI * this.t) / 1000);

        let ind = 0;
        for (let j = 0; j < this.nz; j++) {
            for (let i = 0; i < this.nx; i++) {
                if (j === 0 ||j === this.nz - 1 || i === 0 || i === this.nx - 1)
                    continue;
                ind += 3;
                this.wnp1[i][j] =
                    2 * this.wn[i][j] -
                    this.wnm1[i][j] +
                    this.CFL ** 2 *
                        (this.wn[i + 1][j] +
                            this.wn[i][j + 1] -
                            4 * this.wn[i][j] +
                            this.wn[i - 1][j] +
                            this.wn[i][j - 1]);

                position.array[ind + 1] = this.wn[i][j];
            }
        }

        position.needsUpdate = true;
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

function sleep(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}
