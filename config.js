export const COLORS = {
  wall: "#3A5025",
  floor: "#51733A",
  shadowOnFloor: "#476633",
  enemy: "#9C528B",
  player: "#0582CA",
  playerBullet: "#F18F01",
  towerBase: "#157F1F",
  towerBullet: "#4CB963",
  hueNames: {
    0: 'Apple',
    36: 'Orange',
    72: 'Pear',
    108: 'Lime',
    144: 'Mint',
    180: 'Clear Sky',
    216: 'Blueberry',
    252: 'Iris',
    288: 'Violet',
    324: 'Grape'
  }
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
  mazeCell: 256,
};

export const WEIGHTS = {
  repulsion: {
    enemy: 0.4,
    bullet: 10,
    player: 0.5,
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