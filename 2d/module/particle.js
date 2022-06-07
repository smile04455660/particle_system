class Particle extends PIXI.Sprite {
    constructor(args) {
        super(args.texture);
        for (const [k, v] of Object.entries(args)) {
            this[k] = v;
        }
        [this.x, this.y] = this.pos.a.map((e) => Math.round(e));
        this.anchor.set(0.5);
        this.width = 2 * this.radius;
        this.height = 2 * this.radius;
    }

    applyAcce(vec) {
        if (!vec instanceof Vector) throw new TypeError("vec must be a Vector");
        this.speed.add(vec);
    }

    update() {
        this.lifespan--;
        this.pos.add(this.speed);
        [this.x, this.y] = this.pos.a.map((e) => Math.round(e));
    }

    _getCollideSpeed(normal) {
        const dotted = this.speed.dot(normal);
        const ret = this.speed.subtract(normal.multiply(2 * dotted));
        return ret;
    }

    setCollided(collision) {
        const { normal } = collision;
        const new_speed = this._getCollideSpeed(normal);
        this.speed = new_speed;
    }

    show() {}

    isInView(width, height) {
        return this.x >= 0 && this.y >= 0 && this.x < width && this.y < height;
    }

    isDead() {
        return this.lifespan <= 0;
    }
}

class WaterParticle extends Particle {
    constructor(args) {
        args.texture = PIXI.Texture.from("assets/blue_circle.png");
        super(args);
    }

    setCollided(collision) {
        const { normal } = collision;
        const new_speed = this._getCollideSpeed(normal).divide(2);
        this.speed = new_speed;
    }

    isDead() {
        return false;
    }
}

class SmokeParticle extends Particle {
    constructor(args) {
        args.texture = PIXI.Texture.from("assets/smoke.png");
        super(args);
        this.total_lifespan = this.lifespan;
        this.blendMode = PIXI.BLEND_MODES.ADD;
    }

    update() {
        // console.log("ls, lsc:", this.lifespan, this.lifespan_change);
        this.lifespan--;
        const lifespan_portion = Math.max(
            this.lifespan / this.total_lifespan,
            0
        );
        this.radius =
            (this.init_size - this.end_size) * lifespan_portion + this.end_size;
        this.width = 2 * this.radius;
        this.height = 2 * this.radius;
        this.alpha = lifespan_portion;
        this.pos.add(this.speed);
        [this.x, this.y] = this.pos.a.map((e) => Math.round(e));
    }
}

class FireworkParticle extends Particle {
    constructor(args, isChild) {
        args.texture = PIXI.Texture.from("assets/white_circle.png");
        super(args);
        this.args = args;
        this.isChild = isChild;
        this.total_lifespan = this.lifespan;
    }

    update() {
        this.lifespan--;
        // if (this.isChild) this.speed.divide(1.1);
        this.pos.add(this.speed);
        [this.x, this.y] = this.pos.a.map((e) => Math.round(e));
    }

    explode(num_children, explode_velocity) {
        const children = [];
        for (let i = 0; i < num_children; i++) {
            const child = new FireworkParticle(this.args, true);
            const [angle, length] = this._genExplodeAngleLength();
            child.pos = Vector.fromPolar(angle, length).add(this.pos);
            child.speed = this._genExplodeSpeed(angle, explode_velocity);
            child.tint = this.tint;
            child.lifespan = this.total_lifespan * 0.65;
            children.push(child);
        }
        return children;
    }

    _genExplodeAngleLength() {
        const angle = Math.PI * 2 * Math.random();
        const length = (Math.random() + 0.05) * this.radius;
        return [angle, length];
    }

    _genExplodeSpeed(angle, velocity) {
        return Vector.fromPolar(angle, Math.random()*velocity);
    }

    show() {
        if (this.isChild) {
            this.alpha = this.lifespan / this.total_lifespan;
        }
    }
}
