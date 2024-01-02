class Wall extends Entity {
  constructor(xStart, xEnd, yStart, yEnd) {
    super((xStart + xEnd)/2, (yStart + yEnd)/2);

    this.xStart = xStart;
    this.xEnd = xEnd;
    this.yStart = yStart;
    this.yEnd = yEnd;

    this.shape = new RectShapedSprite(
      this.xStart - SIZES.wallWidth,
      this.xEnd + SIZES.wallWidth,
      this.yStart - SIZES.wallWidth,
      this.yEnd + SIZES.wallWidth,
      COLORS.wall
    )
  }

  tick() {}

  // Override. Walls don't move.
  move() {}

  render(context) {
    this.shape.render(context);
  }

  collide(other, collisionPoint) {}
}