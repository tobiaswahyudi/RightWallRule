// Inspired by the Chipmunk library's Collision Hash
// https://chipmunk-physics.net/release/ChipmunkLatest-Docs/#cpSpace-SpatialHash
class CollisionHashMap {
  constructor() {
    this.map = new Map();
  }

  coordsToChunk(pos) {
    return {
      col: Math.floor(pos.x / CONFIG.collisionMapChunkSize),
      row: Math.floor(pos.y / CONFIG.collisionMapChunkSize)
    };
  }

  getChunk(chunk) {
    const chunkKey = `${chunk.row},${chunk.col}`;
    if(this.map.get(chunkKey) == undefined) {
      this.map.set(chunkKey, new Set());
    }
    return this.map.get(chunkKey);
  }

  chunkAddEntity(chunk, entity) {
    const theChunk = this.getChunk(chunk);
    theChunk.add(entity);
  }

  chunkDeleteEntity(chunk, entity) {
    const theChunk = this.getChunk(chunk);
    theChunk.delete(entity);
  }

  registerEntity(entity) {
    const corners = entity.shape.boundingBoxCorners();
    entity.shape.collisionCellCorners = Array(4);

    corners.forEach((corner, idx) => {
      const cornerChunk = this.coordsToChunk(corner);
      entity.shape.collisionCellCorners[idx] = cornerChunk;
      this.chunkAddEntity(cornerChunk, entity);
    })
  }

  updateEntity(entity) {
    const corners = entity.shape.boundingBoxCorners();

    corners.forEach((corner, idx) => {
      const cornerChunk = this.coordsToChunk(corner);
      const oldChunk = entity.shape.collisionCellCorners[idx];
      entity.shape.collisionCellCorners[idx] = cornerChunk;
      if(cornerChunk.row != oldChunk.row || cornerChunk.col != oldChunk.col) {
        this.chunkDeleteEntity(oldChunk, entity);
        this.chunkAddEntity(cornerChunk, entity);
      }
    })
  }

  *candidatePairs() {
    // return function* pairsGen() {
      for(const [key, chunkSet] of this.map) {
        let i = 0;
        let j = 0;
        for(const el1 of chunkSet) {
          i++;
          for(const el2 of chunkSet) {
            j++;
            if(j > i) yield [el1, el2];
          }
          j = 0;
        }
      }
    // }
  }
}