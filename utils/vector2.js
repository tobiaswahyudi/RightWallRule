export class Vector2 {
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

  // Returns a new Vector2; `this` rotated `deg` degrees CW
  rotate(deg) {
    const theta = Math.PI * deg / 180;
    return new Vector2(this.x * Math.cos(theta) + this.y * Math.sin(theta), this.y * Math.cos(theta) - this.x * Math.sin(theta));
  }

  // Returns the CCW angle in radians between this vector and (1, 0);
  get theta() {
    return Math.atan2(this.y, this.x);
  }

  get thetaDeg() {
    return this.theta / Math.PI * 180;
  }

  // Returns this vector rotated 90 degrees.
  perp() {
    return this.rotate(90);
  }

  projectionLength(rhs) {
    return (this.x * rhs.x + this.y * rhs.y) / (rhs.magnitude || 1);
  }
}