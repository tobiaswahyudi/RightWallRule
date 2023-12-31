class Entity {
  constructor(x, y) {
    this.position = new Vector2(x, y);
    this.heading = new Vector2(0,0);
    this.velocity = 0;
  }

  move() {
    this.position.add(this.heading.copy.scale(this.velocity));
  }

  get rotation() {
    if(this.heading.x == 0 && this.heading.y == 0) return 0;
    return Math.atan(this.heading.y / this.heading.x);
  }
}
