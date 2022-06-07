class Vector {
    constructor() {
        if (arguments.length === 0)
            throw new Error("Vector length must be a positive number");

        if (Array.isArray(arguments[0])) this.a = Array.from(arguments[0]);
        else if (arguments[0] instanceof Vector)
            this.a = Array.from(arguments[0].a);
        else {
            this.a = [];
            for (let i = 0; i < arguments.length; i++) {
                this.a.push(arguments[i]);
            }
        }

        this.dimension = this.a.length;
    }

    dot(x) {
        if (!x instanceof Vector) throw new TypeError("Input must be a Vector");
        if (this.dimension !== x.dimension)
            throw new Error("Dimension mismatch");
        return this.a.map((v, i) => v * x.a[i]).reduce((a, b) => a + b);
    }

    multiply(x) {
        if (typeof x === "number") {
            this.a = this.a.map((v) => x * v);
            return this;
        } else if (x instanceof Vector) {
            this.a = this.a.map((v, i) => v * x.a[i]);
            return this;
        } else throw new TypeError("Input must be a number or Vector");
    }

    divide(x) {
        if (typeof x === "number") {
            this.a = this.a.map((v) => v / x);
            return this;
        } else if (x instanceof Vector) {
            this.a = this.a.map((v, i) => v / x.a[i]);
            return this;
        } else throw new TypeError("Input must be a number or Vector");
    }

    add(x) {
        if (!x instanceof Vector) throw new TypeError("x must be a vector");
        this.a = this.a.map((v, i) => v + x.a[i]);
        return this;
    }

    subtract(x) {
        if (!x instanceof Vector) throw new TypeError("x must be a vector");
        this.a = this.a.map((v, i) => v - x.a[i]);
        return this;
    }

    normalize() {
        const norm = Math.sqrt(
            this.a.map((e) => e ** 2).reduce((a, b) => a + b)
        );
        this.a = this.a.map((v) => v / norm);
        return this;
    }

    static distance(a, b) {
        if (!a instanceof Vector || !b instanceof Vector)
            throw new TypeError("input must be a vector");
        if (!a.dimension || !b.dimension) throw new Error("dimension mismatch");

        return Math.sqrt(
            a.a.map((e, i) => (e - b.a[i]) ** 2).reduce((a, b) => a + b)
        );
    }

    static fromPolar(angle, length) {
        return new Vector(Math.cos(angle), Math.sin(angle)).multiply(length);
    }
}
