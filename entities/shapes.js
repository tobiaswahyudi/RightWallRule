/**************************************
 * SHAPES
 * 
 * Used for checking hitboxes.
 * For now we're rendering pr1imitive shapes, so these are also used for rendering.
 * We may use sprites later.
 **************************************/

// A sprite with a circle shaped hitbox.
class CircleShapedSprite {
  // Takes a reference to the entity's position, radius, and color.
  constructor(anchorPosition, radius, color) {
    this.anchorPosition = anchorPosition;
    this.radius = radius;
    this.color = color;
  }

  render(context) {
    context.fillStyle = this.color;

    context.beginPath();
    context.ellipse(
      this.anchorPosition.x, this.anchorPosition.y,
      this.radius, this.radius,
      0, 0, 360
    );
    context.fill();
  }

  boundingBoxCorners() {
    return [
      new Vector2(this.anchorPosition.x - this.radius, this.anchorPosition.y - this.radius),
      new Vector2(this.anchorPosition.x + this.radius, this.anchorPosition.y - this.radius),
      new Vector2(this.anchorPosition.x + this.radius, this.anchorPosition.y + this.radius),
      new Vector2(this.anchorPosition.x - this.radius, this.anchorPosition.y + this.radius)
    ];
  }
}

// A sprite with a rectangle shaped hitbox.
class RectShapedSprite {
  constructor(xStart, xEnd, yStart, yEnd, color) {
    this.xStart = xStart;
    this.xEnd = xEnd;
    this.yStart = yStart;
    this.yEnd = yEnd;

    console.log(xStart,xEnd,yStart,yEnd);
    this.color = color;
  }

  render(context) {
    context.fillStyle = COLORS.wall;

    context.fillRect(
      this.xStart,
      this.yStart,
      this.xEnd - this.xStart,
      this.yEnd - this.yStart
    );
  }

  boundingBoxCorners() {
    return [
      new Vector2(this.xStart, yStart),
      new Vector2(this.xEnd, yStart),
      new Vector2(this.xEnd, yEnd),
      new Vector2(this.xStart, yEnd)
    ];
  }
}