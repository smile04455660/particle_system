class Waterfall extends PIXI.Container {
    constructor(view, new_particles, max_particles, gravity) {
        super();
        const { width, height } = view;
        this.particles = [];
        this.gravity = gravity;
        this.init_particles = 5;
        this.max_particles = max_particles;
        this.new_particles = new_particles;

        this.view_width = width;
        this.view_height = height;

        this.particleProps = {
            radius: 3,
        };

        for (let i = 0; i < this.init_particles; i++) {
            this._updateParticleProps();
            const particle = new WaterParticle(this.particleProps);
            this.particles.push(particle);
            this.addChild(particle);
        }
    }

    update(obstacles) {
        if (this.particles.length < this.max_particles) {
            for (
                let i = 0;
                i < this.max_particles && i < this.new_particles;
                i++
            ) {
                this._updateParticleProps();
                const newParticle = new WaterParticle(this.particleProps);
                this.particles.push(newParticle);
                this.addChild(newParticle);
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            let particle = this.particles[i];

            // speed integral
            particle.applyAcce(this.gravity);

            // position integral
            particle.update();

            if (obstacles) {
                for (let obstacle of obstacles) {
                    const collision = obstacle.collide(particle);

                    if (collision) {
                        particle.setCollided(collision);
                        break;
                    }
                }
            }

            if (!particle.isInView(this.view_width, this.view_height)) {
                particle.destroy();
                this.particles.splice(i, 1);
            }
        }

        let np = document.getElementById("num_particles");
        np.innerText = this.particles.length;
    }

    show() {
        for (let particle of this.particles) {
            particle.show();
        }
    }

    _updateParticleProps() {
        this.particleProps.pos = new Vector(
            this._generateXCoor(this.view_width),
            0
        );
        this.particleProps.speed = new Vector(
            this._generateXSpeed(this.view_width),
            this._generateYSpeed(this.view_height)
        );
    }

    _generateXCoor(width) {
        return Math.round(Math.random() * width);
    }

    _generateXSpeed(width) {
        return ((Math.random() - 0.5) * width) / 1000;
    }

    _generateYSpeed(height) {
        return ((Math.random() / 2) * height) / 100;
    }
}
