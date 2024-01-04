class UnionFind {
  constructor(capacity) {
    this.parent = Array(capacity).fill(0).map((v,i) => i);
    this.size = Array(capacity).fill(1);
  }

  findPar(idx) {
    if(this.parent[idx] == idx) return idx;
    return this.parent[idx] = this.findPar(this.parent[idx]);
  }

  unite(a,b) {
    const rootA = this.findPar(a);
    const rootB = this.findPar(b);

    if(this.size[rootA] > this.size[rootB]) {
      this.parent[rootB] = rootA;
      this.size[rootA] += this.size[rootB];
    } else {
      this.parent[rootA] = rootB;
      this.size[rootB] += this.size[rootA];
    }
  }

  yieldingParent(a,b) {
    const rootA = this.findPar(a);
    const rootB = this.findPar(b);

    if(this.size[rootA] > this.size[rootB]) return rootB;
    else return rootA;
  }
}