gameEngine.player = player;
player.position.x = CONFIG.mazeCellSize/2;
player.position.y = CONFIG.mazeCellSize/2;
gameEngine.collisionMap.registerEntity(player);

gameEngine.input = new GameInputManager(); 

// Walls
gameEngine.maze.generateWalls().forEach(([xStart, yStart, xEnd, yEnd]) => {
  gameEngine.spawnEntity("wall", new Wall(xStart * CONFIG.mazeCellSize, yStart * CONFIG.mazeCellSize, xEnd * CONFIG.mazeCellSize, yEnd  * CONFIG.mazeCellSize));
})

const mazeTotalSize = CONFIG.mazeGridSize * CONFIG.mazeCellSize;

gameEngine.spawnEffect(EFFECTS.layer.under, new RectEffect(-window.innerWidth, 0, -window.innerHeight, mazeTotalSize + window.innerHeight, thunk, COLORS.enemy));
gameEngine.spawnEffect(EFFECTS.layer.under, new RectEffect(-window.innerWidth, mazeTotalSize + window.innerWidth, -window.innerHeight, 0, thunk, COLORS.enemy));

gameEngine.spawnEffect(EFFECTS.layer.under, new RectEffect(mazeTotalSize, mazeTotalSize + window.innerWidth, -window.innerHeight, mazeTotalSize + window.innerHeight, thunk, COLORS.enemy));
gameEngine.spawnEffect(EFFECTS.layer.under, new RectEffect(-window.innerWidth, mazeTotalSize + window.innerWidth, mazeTotalSize, mazeTotalSize + window.innerHeight, thunk, COLORS.enemy));

for(let i = 0; i < 50; i++)
  gameEngine.spawnEntity("enemy", new CrawlerEnemy(
    (1.5 * CONFIG.mazeCellSize) + ((Math.random() - 0.5) * (CONFIG.mazeCellSize - 2 * SIZES.wallWidth)),
    (1.5 * CONFIG.mazeCellSize) + ((Math.random() - 0.5) * (CONFIG.mazeCellSize - 2 * SIZES.wallWidth))
  ));

for(let i = 0; i < 50; i++)
  gameEngine.spawnEntity("enemy", new CrawlerEnemy(
    (2.5 * CONFIG.mazeCellSize) + ((Math.random() - 0.5) * (CONFIG.mazeCellSize - 2 * SIZES.wallWidth)),
    (2.5 * CONFIG.mazeCellSize) + ((Math.random() - 0.5) * (CONFIG.mazeCellSize - 2 * SIZES.wallWidth))
  ));

gameEngine.start(document.getElementById('the-canvas'), window);