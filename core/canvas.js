export class ScaledCanvas {
  constructor(canvas, scale) {
    this.canvas = canvas;
    this.scale = scale;

    this.canvas.width = window.innerWidth/scale;
    this.canvas.height = window.innerHeight/scale;
  }

  getContext(type) {
    if(type != '2d') {
      // Whaddaya tryna pull?
      console.error("No 3d, deal with it?");
    }
    return new ScaledCanvasRenderingContext(this.canvas.getContext('2d'), this.scale);
  }
}

class ScaledCanvasRenderingContext {
  constructor(context, scale) {
    this.context = context;
    this.scale = scale;

    // turn off image aliasing
    this.context.msImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.imageSmoothingEnabled = false;
  }

  fillRect(x, y, width, height) {
    this.context.fillRect(x/this.scale, y/this.scale, width/this.scale, height/this.scale);
  }

  strokeRect(x, y, width, height) {
    this.context.strokeRect(x/this.scale, y/this.scale, width/this.scale, height/this.scale);
  }

  ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise = false) {
    this.context.ellipse(x/this.scale, y/this.scale, radiusX/this.scale, radiusY/this.scale, rotation, startAngle, endAngle, counterclockwise);
  }

  fillText(text, x, y, maxWidth = undefined) {
    this.context.fillText(text, x/this.scale, y/this.scale, maxWidth ? maxWidth/this.scale : undefined);
  }

  translate(x, y) { this.context.translate(x/this.scale, y/this.scale) }
  resetTransform() { this.context.resetTransform() }
  beginPath() { this.context.beginPath() }
  fill(...args) { this.context.fill(...args) }
  stroke(...args) { this.context.stroke(...args) }

  set fillStyle(val) { this.context.fillStyle = val }
  set strokeStyle(val) { this.context.strokeStyle = val }
  set font(val) { this.context.font = val }
  set textAlign(val) { this.context.textAlign = val }
}