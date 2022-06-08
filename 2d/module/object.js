class Rocket extends PIXI.Sprite {
    constructor(args) {
        super(PIXI.Texture.from("assets/rocket.png"));
        for (const [k, v] of Object.entries(args)) {
            this[k] = v;
        }
        [this.x, this.y] = this.pos.a.map((e) => Math.round(e));
        this.anchor.x = 0.5;
        this.anchor.y = 1;
        this.zIndex = 10;
    }
}