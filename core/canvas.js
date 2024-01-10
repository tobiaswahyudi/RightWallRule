export class ScaledCanvas {
  constructor(canvas, scaleRatio) {
    this.canvas = canvas;
    this.scaleRatio = scaleRatio;

    this.canvas.width = window.innerWidth/scaleRatio;
    this.canvas.height = window.innerHeight/scaleRatio;
  }

  getContext(type) {
    if(type != '2d') {
      // Whaddaya tryna pull?
      console.error("No 3d, deal with it?");
    }
    return new ScaledCanvasRenderingContext(this.canvas.getContext('2d'), this.scaleRatio);
  }
}

class ScaledCanvasRenderingContext {
  constructor(context, scaleRatio) {
    this.context = context;
    this.scaleRatio = scaleRatio;

    // turn off image aliasing
    this.context.msImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.imageSmoothingEnabled = false;
  }

  fillRect(x, y, width, height) {
    this.context.fillRect(x/this.scaleRatio, y/this.scaleRatio, width/this.scaleRatio, height/this.scaleRatio);
  }

  strokeRect(x, y, width, height) {
    this.context.strokeRect(x/this.scaleRatio, y/this.scaleRatio, width/this.scaleRatio, height/this.scaleRatio);
  }

  ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise = false) {
    this.context.ellipse(x/this.scaleRatio, y/this.scaleRatio, radiusX/this.scaleRatio, radiusY/this.scaleRatio, rotation, startAngle, endAngle, counterclockwise);
  }

  fillText(text, x, y, maxWidth = undefined) {
    this.context.fillText(text, x/this.scaleRatio, y/this.scaleRatio, maxWidth ? maxWidth/this.scaleRatio : undefined);
  }

  translate(x, y) { this.context.translate(x/this.scaleRatio, y/this.scaleRatio) }
  resetTransform() { this.context.resetTransform() }
  beginPath() { this.context.beginPath() }
  fill(...args) { this.context.fill(...args) }
  stroke(...args) { this.context.stroke(...args) }
  drawImage(...args) { this.context.drawImage(...args) }
  save(...args) { this.context.save(...args) }
  restore(...args) { this.context.restore(...args) }
  rotate(...args) { this.context.rotate(...args) }
  scale(...args) { this.context.scale(...args) }

  set fillStyle(val) { this.context.fillStyle = val }
  set strokeStyle(val) { this.context.strokeStyle = val }
  set lineWidth(val) { this.context.lineWidth = val }
  set font(val) { this.context.font = val }
  set textAlign(val) { this.context.textAlign = val }
}