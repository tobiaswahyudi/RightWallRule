gameEngine.player = player;
player.position.x = CONFIG.mazeCellSize/2;
player.position.y = CONFIG.mazeCellSize/2;
gameEngine.collisionMap.registerEntity(player);

gameEngine.input = new GameInputManager(); 

// Walls
gameEngine.maze.generateWalls().forEach(([xStart, yStart, xEnd, yEnd]) => {
  gameEngine.spawnEntity("wall", new Wall(xStart * CONFIG.mazeCellSize, yStart * CONFIG.mazeCellSize, xEnd * CONFIG.mazeCellSize, yEnd  * CONFIG.mazeCellSize));
})

for(let i = 0; i < 200; i++)
  gameEngine.spawnEntity("enemy", new CrawlerEnemy(Math.random() * CONFIG.mazeCellSize * CONFIG.mazeGridSize, Math.random() * CONFIG.mazeCellSize * CONFIG.mazeGridSize));

gameEngine.start(document.getElementById('the-canvas'), window);