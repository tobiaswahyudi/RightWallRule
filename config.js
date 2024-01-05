const COLORS = {
  wall: "#3A5025",
  floor: "#51733A",
  shadowOnFloor: "#476633",
  enemy: "#9C528B",
  player: "#0582CA",
  playerBullet: "#F18F01",
  towerBase: "#157F1F",
  towerBullet: "#4CB963"
};

const SIZES = {
  cell: 100,
  wallWidth: 60,
  playerRadius: 30,
  enemyRadius: 20,
  bulletRadius: 7.5,
  bulletSmokeRadius: {
    min: 5,
    max: 10
  }
};

const CONFIG = {
  FPS: 60,
  pixelation: 1,
  collisionMapChunkSize: 60,
  mazeCellSize: 480,
  mazeGridSize: 16
};

const WEIGHTS = {
  repulsion: {
    enemy: 0.24,
    bullet: 10,
    player: 0.36,
  }
}

const SPEEDS = {
  player: 3,
  bullet: 12,
}