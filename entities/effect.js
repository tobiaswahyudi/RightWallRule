const EFFECTS = {
  layer: {
    under: "under",
    above: "above",
  }
}

class Effect {
  constructor(x, y, animation) {
    this.position = new Vector2(x, y);
    this.animation = animation;
    this.endTick = 0;
  }

  tick(ticks) {
    if(this.animation) this.animation(this, ticks);
    if(this.endTick <= ticks) gameEngine.deleteEffect(this);
  }
}

class CircleEffect extends Effect {
  constructor(x, y, animation, radius, color) {
    super(x, y, animation);
    this.originalRadius = radius;
    this.radius = radius;
    this.color = color;
  }

  render(context) {
    context.fillStyle = this.color;

    context.beginPath();
    context.ellipse(
      this.position.x, this.position.y,
      this.radius, this.radius,
      0, 0, 360
    );
    context.fill();
  }
}

class RectEffect extends Effect {
  constructor(xStart, xEnd, yStart, yEnd, animation, color) {
    super((xStart + xEnd)/2, (yStart + yEnd) / 2, animation);
    this.xStart = xStart;
    this.xEnd = xEnd;
    this.yStart = yStart;
    this.yEnd = yEnd;
    this.color = color;
  }

  render(context) {
    context.fillStyle = this.color;

    context.fillRect(
      this.xStart,
      this.yStart,
      this.xEnd - this.xStart,
      this.yEnd - this.yStart
    );
  }
}
