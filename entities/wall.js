class Wall extends Entity {
  constructor(xStart, xEnd, yStart, yEnd) {
    super();

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

  render(context) {
    this.shape.render(context);
  }
}