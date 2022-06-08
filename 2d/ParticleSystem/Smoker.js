class Smoker extends PIXI.Container {
    constructor(
        view,
        num_particles, // per frame
        velocity,
        pos,
        lifespan,
        size_params
    ) {
        super();
        const { width, height } = view;
        this.view_width = width;
        this.view_height = height;
        this.num_particles = num_particles;
        this.velocity = velocity;
        this.pos = pos;
        this.lifespan = lifespan;
        const { init_size, end_size, div_size } = size_params;
        this.init_size = init_size;
        this.end_size = end_size;
        this.div_size = div_size; // divergence
        this.particles = [];
        this.rocket = new Rocket({
            pos: new Vector([width / 2, height / 2 + 50]),
            width: 200,
            height: 200,
        })
        this.addChild(this.rocket);
    }

    update(args) {
        const { accelerations, num_particles, rotation } = args;
        if (num_particles)
            this.num_particles = num_particles;
        if (rotation)
            this.rocket.rotation = rotation;
        for (let i = 0; i < this.num_particles; i++) {
            const particleProps = {
                pos: this._generatePosDiff().add(this.pos),
                speed: this._generateSpeed(),
                radius: this.init_size,
                init_size: this.init_size,
                end_size: this.end_size,
                lifespan: this.lifespan,
            };
            const particle = new SmokeParticle(particleProps);
            particle.tint = 0xe25822;
            // particle.tint = Array(3)
            //     .fill(0)
            //     .map(() => Math.floor(Math.random() * 256))
            //     .reduce((a, b) => a * 256 + b);
            this.particles.push(particle);
            this.addChild(particle);
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            let particle = this.particles[i];

            if (accelerations)
                accelerations.forEach((a) => particle.applyAcce(a));

            particle.update();

            if (
                !particle.isInView(this.view_width, this.view_height) ||
                particle.isDead()
            ) {
                particle.destroy();
                this.particles.splice(i, 1);
            }
        }
    }

    _generateRandom2dVector() {
        const angle = 2 * Math.PI * Math.random();
        const intensity = Math.random();
        return new Vector(Math.cos(angle), Math.sin(angle)).multiply(intensity);
    }

    _generatePosDiff() {
        return this._generateRandom2dVector().multiply(this.div_size);
    }

    _generateSpeed() {
        return this._generateRandom2dVector().multiply(this.velocity);
    }

    show() {
        this.particles.forEach((particle) => particle.show());
    }
}
