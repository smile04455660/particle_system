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
        this.num_star = 1;
        this.max_star = 50;
        this.stars = []
        this.addChild(this.rocket);
        this.sortableChildren = true;
        this.flag = 0;
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

        if (this.flag > 3) {
            for (let i = 0; i < this.num_star; i++) {
                const particleProps = {
                    pos: new Vector(
                        Math.round(Math.random() * this.view_width),
                        0,
                    ),
                    speed: new Vector(0, 0),
                    radius: 3,
                };
                const star = new StarParticle(particleProps);
                this.stars.push(star);
                this.addChild(star);
            }
            this.flag = 0;
        }
        else {
            this.flag++;
        }

        for (let i = this.stars.length - 1; i >= 0; i--) {
            let star = this.stars[i];

            if (accelerations) {
                const x = accelerations[0].a[0] * 3.5;
                const y = 1;
                const speed = accelerations[0].a[1] * 50;
                star.applySpeed(
                    new Vector(x * speed, y * speed)
                )
            }

            star.update();

            if (
                !star.isInView(this.view_width, this.view_height) ||
                star.isDead()
            ) {
                star.destroy();
                this.stars.splice(i, 1);
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
