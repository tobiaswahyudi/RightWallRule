import { Vector2 } from "../utils/vector2.js";

/**
 * Manages key presses.
 */
class RawInputManager {
  constructor() {
    this.newlyPressedKeys = new Set();
    this.pressedKeys = new Set();
    // A list of sets of keys; if 
    this.exclusions = [
      ["ArrowUp", "ArrowDown"],
      ["ArrowLeft", "ArrowRight"],
      ["KeyW", "KeyS"],
      ["KeyA", "KeyD"],
    ]
    this.mousePosition = new Vector2();
    this.mousePressed = false;
  }

  maintainExclusions(keyCode) {
    const exclusion = this.exclusions.find(excl => excl.includes(keyCode));
    exclusion?.forEach(exclKeyCode => this.pressedKeys.delete(exclKeyCode));
  }

  keyDown(event) {
    const keyCode = event.code;

    if(!this.pressedKeys.has(keyCode)) this.newlyPressedKeys.add(keyCode);

    this.maintainExclusions(keyCode);
    this.pressedKeys.add(keyCode);
  }

  keyUp(event) {
    const keyCode = event.code;
    this.pressedKeys.delete(keyCode);
  }

  mouseMove(event) {
    this.mousePosition.x = event.x;
    this.mousePosition.y = event.y;
  }

  mouseDown(event) {
    this.mousePressed = true;
  }

  mouseUp(event) {
    this.mousePressed = false;
  }

  setupListeners(window) {
    window.onkeydown = this.keyDown.bind(this);
    window.onkeyup = this.keyUp.bind(this);
    window.onmousemove = this.mouseMove.bind(this);
    window.onmousedown = this.mouseDown.bind(this);
    window.onmouseup = this.mouseUp.bind(this);
  }

  tick() {
    this.newlyPressedKeys.clear();
  }
}

/**
 * Manages key bindings.
 */
export class GameInputManager {
  constructor(screenWidth, screenHeight) {
    this.rawInput = new RawInputManager();
    const screenSize = new Vector2(window.innerWidth, window.innerHeight);
    this.screenCenter = screenSize.scale(0.5);
  }

  setupListeners(window) {
    this.rawInput.setupListeners(window);
  }

  get movement() {
    const mvmt = new Vector2(0,0);
    if(this.rawInput.pressedKeys.has("KeyW")) mvmt.y = -1;
    if(this.rawInput.pressedKeys.has("KeyS")) mvmt.y = 1;
    if(this.rawInput.pressedKeys.has("KeyA")) mvmt.x = -1;
    if(this.rawInput.pressedKeys.has("KeyD")) mvmt.x = 1;

    if(mvmt.x != 0 && mvmt.y != 0) {
      mvmt.scale(1/Math.sqrt(2));
    }

    return mvmt;
  }

  get shooting() {
    return this.rawInput.mousePressed;
  }

  get shootDir() {
    return this.rawInput.mousePosition.delta(this.screenCenter).normalize();
  }

  tick() {
    this.rawInput.tick();
  }
}