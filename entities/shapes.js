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

  collisionCheck(other) {
    if(other instanceof CircleShapedSprite) {
      // Circle-to-circle collision check
      const distance = other.anchorPosition.delta(this.anchorPosition).hypot();
      if(distance < (this.radius + other.radius))
        return other.anchorPosition.delta(this.anchorPosition)
          .scale(this.radius / (this.radius + other.radius))
          .add(this.anchorPosition);
    } else if(other instanceof RectShapedSprite) {
      // Annoying!
      // Circle-to-rectangle collision check. There are two cases here.
      if(other.xStart < this.anchorPosition.x && this.anchorPosition.x < other.xEnd) {
        // Case 1a: The circle's center is within the rectangle's x-bounds.
        if(other.yStart < this.anchorPosition.y && this.anchorPosition.y < other.yEnd) {
          // The damn thing's inside the damn square
          return new Vector2(other.xStart + other.xEnd, other.yStart + other.yEnd).scale(0.5);
        } else if(this.anchorPosition.y <= other.yStart) {
          // Above the square (lower y)
          if(other.yStart - this.anchorPosition.y < this.radius)
            return new Vector2(this.anchorPosition.x, other.yStart);
        } else {
          // Below the square (higher y)
          if(this.anchorPosition.y - other.yEnd < this.radius)
            return new Vector2(this.anchorPosition.x, other.yEnd);
        }
      } else if(other.yStart < this.anchorPosition.y && this.anchorPosition.y < other.yEnd) {
        // Case 1b: The circle's center is within the rectangle's y-bounds.
        if(this.anchorPosition.x <= other.xStart) {
          // Left of the square
          if(other.xStart - this.anchorPosition.x < this.radius)
            return new Vector2(other.xStart, this.anchorPosition.y);
        } else {
          // Right of the square
          if(this.anchorPosition.x - other.xEnd < this.radius)
          return new Vector2(other.xEnd, this.anchorPosition.y);
        }
      } else {
        // Case 2: Check the circle's distance to the nearest corner.
        let nearestCorner;
        if(this.anchorPosition.x < other.xStart) {
          // On left
          if(this.anchorPosition.y < other.yStart) {
            // Above
            nearestCorner = new Vector2(this.xStart, this.yStart);
          } else {
            // Below
            nearestCorner = new Vector2(this.xStart, this.yEnd);
          }
        } else {
          // On right
          if(this.anchorPosition.y < other.yStart) {
            // Above
            nearestCorner = new Vector2(this.xEnd, this.yStart);
          } else {
            // Below
            nearestCorner = new Vector2(this.xEnd, this.yEnd);
          }
        }
        if(this.anchorPosition.delta(nearestCorner).hypot() < this.radius)
          return nearestCorner;
      }
    } else {
      console.error("I don't know what kind of hitbox this is:", other);
    }
    return null;
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
      new Vector2(this.xStart, this.yStart),
      new Vector2(this.xEnd, this.yStart),
      new Vector2(this.xEnd, this.yEnd),
      new Vector2(this.xStart, this.yEnd)
    ];
  }

  collisionCheck(other) {
    if(other instanceof CircleShapedSprite) {
      // Rect-to-circle collision check
      return other.collisionCheck(this);
    } else if(other instanceof RectShapedSprite) {
      // Rectangle-to-rectangle collision check.
      if(other.xEnd < this.xStart) return false; // On left
      if(this.xEnd < other.xStart) return false; // On right
      if(other.yEnd < this.yStart) return false; // Above
      if(this.yEnd < other.yStart) return false; // Below
      // Must overlap
      return true;
    } else {
      console.error("I don't know what kind of hitbox this is:", other);
    }
  }
}