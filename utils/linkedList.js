export class LinkedListNode {
  constructor() {
    this._next = null;
  }
}

export class LinkedList {
  constructor() {
    this._head = null;
    this._tail = null;
  }

  empty() {
    return (this._head == null);
  }

  push(val) {
    if(this.empty()) {
      this._head = this._tail = val;
    } else {
      this._tail._next = val;
      this._tail = val;
    }
  }

  pop() {
    const oldHead = this._head;
    this._head = this._head._next;
    if(this._head == null) this._tail = null;
    oldHead._next = null;
    return oldHead;
  }

  get head() {
    return this._head;
  }
}