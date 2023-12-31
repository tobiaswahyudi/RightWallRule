class Wall extends Entity {
  constructor(xStart, xEnd, yStart, yEnd) {
    super();

    this.xStart = xStart;
    this.xEnd = xEnd;
    this.yStart = yStart;
    this.yEnd = yEnd;
  }

  tick() {}

  render(context) {
    context.fillStyle = COLORS.wall;

    context.fillRect(
      this.xStart - SIZES.wallWidth,
      this.yStart - SIZES.wallWidth,
      this.xEnd - this.xStart + 2*SIZES.wallWidth,
      this.yEnd - this.yStart + 2*SIZES.wallWidth
    );
  }
}