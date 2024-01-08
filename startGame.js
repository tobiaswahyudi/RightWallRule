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

// Shuffle dead ends
gameEngine.maze.deadEnds.sort((a,b) => coinFlip(0.5) ? -1 : 1);
gameEngine.maze.deadEnds.slice(0, 10).forEach(cell => {
  gameEngine.spawnEntity("spawner", new Spawner(cell.center.x, cell.center.y, 12 * CONFIG.FPS));
})

gameEngine.start(document.getElementById('the-canvas'), window);