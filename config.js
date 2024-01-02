const COLORS = {
  wall: "#1D3427",
  floor: "#335B43",
  enemy: "#9C528B",
  player: "#0582CA",
  playerBullet: "#F18F01",
  towerBase: "#157F1F",
  towerBullet: "#4CB963"
};

const SIZES = {
  cell: 100,
  wallWidth: 35,
  playerRadius: 20,
  enemyRadius: 10,
  bulletRadius: 3,
};

const CONFIG = {
  FPS: 60,
  collisionMapChunkSize: 50,
};

const WEIGHTS = {
  repulsion: {
    enemy: 0.24,
    player: 0.36,
  }
}

const SPEEDS = {
  player: 3,
  bullet: 12,
}