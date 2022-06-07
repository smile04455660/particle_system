class Firework extends PIXI.Container {
    constructor(
        view,
        emit_possibility,
        num_children,
        velocity,
        pos,
        size,
        lifespan
    ) {
        super();
        const { width, height } = view;
        this.view_width = width;
        this.view_height = height;
        this.emit_possibility = emit_possibility;
        this.num_children = num_children;
        this.velocity = velocity;
        this.pos = pos;
        this.size = size;
        this.lifespan = lifespan;
        this.particles = [];
    }

    update(accelerations) {
        if (Math.random() < this.emit_possibility) {
            let particleProps = {
                radius: this.size,
                speed: this._generateSpeed(),
                pos: new Vector(this.pos),
                lifespan: this.lifespan,
            };
            const newParticle = new FireworkParticle(particleProps);
            newParticle.tint = Math.random() * 0xffffff;
            this.particles.push(newParticle);
            this.addChild(newParticle);
        }

        console.log(this.particles.length);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];

            if (accelerations)
                accelerations.forEach((a) => particle.applyAcce(a));
            particle.update();

            if (particle.isDead()) {
                let explosionParticles;
                if (!particle.isChild) {
                    explosionParticles = particle.explode(
                        this.num_children,
                        this.velocity * 0.3
                    );
                }

                particle.destroy();
                this.particles.splice(i, 1);

                if (!particle.isChild) {
                    explosionParticles.forEach((particle) => {
                        this.particles.push(particle);
                        this.addChild(particle);
                    });
                }
            }
        }
    }

    _generateSpeed() {
        return new Vector(
            ((Math.random() - 0.5) / 2) * this.velocity,
            -(Math.random() / 4 + 0.75) * this.velocity
        );
    }

    show() {
        this.particles.forEach((particle) => particle.show());
    }
}
