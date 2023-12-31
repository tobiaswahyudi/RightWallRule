class GameObject {
  constructor() {
    this.position = {
      x: 0,
      y: 0
    };
    this.heading = {
      x: 0,
      y: 0
    };
    this.velocity = 0;
  }

  move() {
    this.position.x += this.heading.x * this.velocity;
    this.position.y += this.heading.y * this.velocity;
  }
}
