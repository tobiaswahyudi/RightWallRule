import { CONFIG } from "../config.js";

// Inspired by the Chipmunk library's Collision Hash
// https://chipmunk-physics.net/release/ChipmunkLatest-Docs/#cpSpace-SpatialHash
export class CollisionHashMap {
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
    if(theChunk.size == 0) this.map.delete(`${chunk.row},${chunk.col}`);
  }

  registerEntity(entity) {
    const corners = entity.shape.boundingBoxCorners();
    entity.shape.collisionCellCorners = Array(4);

    corners.forEach((corner, idx) => {
      const cornerChunk = this.coordsToChunk(corner);
      entity.shape.collisionCellCorners[idx] = cornerChunk;
      this.chunkAddEntity(cornerChunk, entity);
    })

    const ulChunk = entity.shape.collisionCellCorners[0];
    const drChunk = entity.shape.collisionCellCorners[2];

    for(let row = ulChunk.row; row <= drChunk.row; row++) {
      for(let col = ulChunk.col; col <= drChunk.col; col++) {
        this.chunkAddEntity({row, col}, entity);
      }
    }
  }

  updateEntity(entity) {
    const cornerChunks = entity.shape.boundingBoxCorners().map(this.coordsToChunk);
    const oldChunks = entity.shape.collisionCellCorners;
    oldChunks.forEach(chunk => this.chunkDeleteEntity(chunk, entity));
    cornerChunks.forEach(chunk => this.chunkAddEntity(chunk, entity));

    entity.shape.collisionCellCorners = cornerChunks;
  }

  deleteEntity(entity) {
    const ulChunk = entity.shape.collisionCellCorners[0];
    const drChunk = entity.shape.collisionCellCorners[2];

    for(let row = ulChunk.row; row <= drChunk.row; row++) {
      for(let col = ulChunk.col; col <= drChunk.col; col++) {
        this.chunkDeleteEntity({row, col}, entity);
      }
    }
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