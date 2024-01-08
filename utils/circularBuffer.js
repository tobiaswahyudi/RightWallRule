export class CircularBuffer {
  constructor(capacity) {
    this.capacity = capacity;
    this.buffer = [];
    this.index = 0;
  }

  push(val) {
    if(this.buffer.length < this.capacity) {
      this.buffer.push(val);
    } else {
      this.buffer[this.index] = val;
      this.index = (this.index + 1) % this.capacity;
    }
  }

  get length() { return this.buffer.length }

  reduce(...args) { return this.buffer.reduce(...args) }
  values() { return this.buffer.values(); }
  [Symbol.iterator]() { return this.buffer[Symbol.iterator](); }
}