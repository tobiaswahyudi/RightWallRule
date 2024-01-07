class MinHeap {
  constructor() {
    this.list = [];
    this.insertionIdx = 0;
  }

  empty() { return this.insertionIdx == 0; }
  parentOf(idx) { return Math.floor(idx / 2); }
  leftChild(idx) { return 2 * idx + 1; }
  rightChild(idx) { return 2 * idx + 2; }
  exists(idx) { return idx < this.insertionIdx; }

  heapifyUp(idx) {
    while(idx != 0 && this.list[this.parentOf(idx)].key > this.list[idx].key) {
      // Swap with parent
      const temp = this.list[idx];
      this.list[idx] = this.list[this.parentOf(idx)];
      this.list[this.parentOf(idx)] = temp;
      idx = this.parentOf(idx);
    }
  }

  heapifyDown(idx) {
    while(this.exists(this.leftChild(idx))) {
      const smallerChild = this.exists(this.rightChild(idx)) && this.list[this.rightChild(idx)].key < this.list[this.leftChild(idx)].key ?
          this.rightChild(idx):
          this.leftChild(idx);

      if(this.list[idx].key > this.list[smallerChild].key) {
        // Swap with smaller child
        const temp = this.list[idx];
        this.list[idx] = this.list[smallerChild];
        this.list[smallerChild] = temp;

        idx = smallerChild;
      } else break;
    }
  }

  push(val) {
    if(this.insertionIdx == this.list.length) this.list.push(val);
    else this.list[this.insertionIdx] = val;
    this.heapifyUp(this.insertionIdx);
    this.insertionIdx++;
  }

  pop() {
    const retVal = this.list[0];
    this.insertionIdx--;
    if(this.insertionIdx != 0) {
      this.list[0] = this.list[this.insertionIdx];
      this.heapifyDown(0);
    }
    this.list[this.insertionIdx] = null;

    return retVal;
  }
}