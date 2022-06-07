class Obstacle extends PIXI.Graphics {
    constructor() {
        super();
    }
    collide(particle) {}
}

class CircleObstacle extends Obstacle {
    constructor(x, y, radius) {
        super();
        this.x = x;
        this.y = y;
        this.pos = new Vector(x, y);
        this.radius = radius;
    }

    collide(particle) {
        const { pos, speed, radius } = particle;

        const distance = this._getDistance(particle);
        if (distance > this.radius + radius) return;

        let posDiff = new Vector(pos).subtract(this.pos);

        if (posDiff.dot(speed) >= 0) return;

        let normal = posDiff.divide(distance);
        return { normal, distance };
    }

    _getDistance(particle) {
        return Vector.distance(this.pos, particle.pos);
    }
}


function generateCircleObstacle(args) {
    const { x, y, radius } = args;
    // const obstacle = new PIXI.Graphics();

    const obstacle = new CircleObstacle(x, y, radius);

    obstacle.beginFill(args.color ? args.color : 0xe2ddd7);
    obstacle.drawCircle(0, 0, radius);

    return obstacle;
}
