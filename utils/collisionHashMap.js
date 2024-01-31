import { CONFIG } from "../config.js";

// Inspired by the Chipmunk library's Collision Hash
// https://chipmunk-physics.net/release/ChipmunkLatest-Docs/#cpSpace-SpatialHash
export class CollisionHashMap {
  constructor() {
    this.map = new Map();
  }

  cornersToChunks(ulCorner, drCorner) {
    const ulChunk = this.coordsToChunk(ulCorner);
    const drChunk = this.coordsToChunk(drCorner);
    const chunks = [];
    for(let row = ulChunk.row; row <= drChunk.row; row++) {
      for(let col = ulChunk.col; col <= drChunk.col; col++) {
        chunks.push({row, col});
      }
    }
    return chunks;
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
    const corners = entity.hitbox.boundingBoxCorners();
    this.cornersToChunks(...corners).forEach(chunk => this.chunkAddEntity(chunk, entity) );
    entity.hitbox.collisionCellCorners = corners;
  }

  updateEntity(entity) {
    this.deleteEntity(entity);
    this.registerEntity(entity);
  }

  deleteEntity(entity) {
    this.cornersToChunks(...entity.hitbox.collisionCellCorners).forEach(chunk => this.chunkDeleteEntity(chunk, entity));
  }

    // In the case where both el1 and el2 are in multiple chunks, they may collide() multiple times.
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