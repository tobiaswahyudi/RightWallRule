class Entity {
  constructor() {
    this.position = new Vector2(0,0);
    this.heading = new Vector2(0,0);
    this.velocity = 0;
  }

  move() {
    this.position.add(this.heading.copy.scale(this.velocity));
  }
}
