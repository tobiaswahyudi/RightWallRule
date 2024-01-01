class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  get copy() {
    return new Vector2(this.x, this.y);
  }

  get magnitude() {
    return Math.hypot(this.x, this.y);
  }

  normalize() {
    const magnitude = this.magnitude || 1;
    this.x /= magnitude;
    this.y /= magnitude;

    return this;
  }

  scale(factor) {
    this.x *= factor;
    this.y *= factor;

    return this;
  }

  // Adds `rhs` to `this`.
  add(rhs) {
    this.x += rhs.x;
    this.y += rhs.y;

    return this;
  }

  // Returns a new Vector2 with `this` at the head and `rhs` at the tail.
  delta(rhs) {
    return new Vector2(this.x - rhs.x, this.y - rhs.y);
  }

  hypot() {
    return Math.hypot(this.x, this.y);
  }
}