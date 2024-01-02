class Entity {
  constructor(x, y) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(0,0);
  }

  move() {
    this.position.add(this.velocity);
  }

  get rotation() {
    if(this.velocity.x == 0 && this.velocity.y == 0) return 0;
    return Math.atan(this.velocity.y / this.velocity.x);
  }
}
