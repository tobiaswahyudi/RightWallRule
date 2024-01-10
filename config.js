export const COLORS = {
  wall: "#3A5025",
  floor: "#51733A",
  shadowOnFloor: "#476633",
  enemy: "#9C528B",
  player: "#0582CA",
  playerBullet: "#F18F01",
  towerBase: "#157F1F",
  towerBullet: "#4CB963"
};

export const SIZES = {
  wallWidth: 30,
  playerRadius: 25,
  enemyRadius: 20,
  bulletRadius: 5,
  bulletSmokeRadius: {
    min: 2,
    max: 4
  },
  mazeCell: 240,
};

export const WEIGHTS = {
  repulsion: {
    enemy: 0.24,
    bullet: 10,
    player: 0.36,
  }
}

export const SPEEDS = {
  player: 6,
  crawler: 1.2,
  bullet: 12,
}

export const CONFIG = {
  FPS: 60,
  pixelation: 1,
  collisionMapChunkSize: 30,
  mazeGridSize: 16
};