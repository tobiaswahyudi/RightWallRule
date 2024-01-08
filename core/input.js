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
    this.mousePosition = {x: 0, y: 0};
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
    this.mouseDown = true;
  }

  setupListeners(window) {
    window.onkeydown = this.keyDown.bind(this);
    window.onkeyup = this.keyUp.bind(this);
    window.onmousemove = this.mouseMove.bind(this);
    window.onmousedown = this.mouseDown.bind(this);
  }

  tick() {
    this.newlyPressedKeys.clear();
    this.mouseDown = false;
  }
}

/**
 * Manages key bindings.
 */
export class GameInputManager {
  constructor() {
    this.rawInput = new RawInputManager();
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
    return this.rawInput.pressedKeys.has("ArrowUp") ||
      this.rawInput.pressedKeys.has("ArrowDown") ||
      this.rawInput.pressedKeys.has("ArrowLeft") ||
      this.rawInput.pressedKeys.has("ArrowRight");
  }

  get shootDir() {
    const dir = new Vector2(0,0);
    if(this.rawInput.pressedKeys.has("ArrowUp")) dir.y = -1;
    if(this.rawInput.pressedKeys.has("ArrowDown")) dir.y = 1;
    if(this.rawInput.pressedKeys.has("ArrowLeft")) dir.x = -1;
    if(this.rawInput.pressedKeys.has("ArrowRight")) dir.x = 1;

    if(dir.x != 0 && dir.y != 0) {
      dir.scale(1/Math.sqrt(2));
    }

    return dir;
  }

  tick() {
    this.rawInput.tick();
  }

  get mousePosition() {
    return this.rawInput.mousePosition;
  }

  get mouseDown() {
    return this.rawInput.mouseDown;
  }
}