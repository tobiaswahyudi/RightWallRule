class Entity {
  constructor(x, y) {
    this.position = new Vector2(x, y);
    this.heading = new Vector2(0,0);
    this.velocity = 0;
  }

  move() {
    this.position.add(this.heading.copy.scale(this.velocity));
  }
}
