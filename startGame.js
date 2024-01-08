gameEngine.player = player;
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

// We need like... Let's say 16 dead ends
if(gameEngine.maze.deadEnds.length < 16) {
  // Statistically unlikely, but possible for sure. Start over :)
  window.location.reload();
}
// Shuffle dead ends
gameEngine.maze.deadEnds.sort((a,b) => coinFlip(0.5) ? -1 : 1);
// Take 1 for player location
player.position.x = gameEngine.maze.deadEnds[0].center.x;
player.position.y = gameEngine.maze.deadEnds[0].center.y;
// Take 10 for spawners
gameEngine.maze.deadEnds.slice(1, 11).forEach(cell => {
  gameEngine.spawnEntity("spawner", new Spawner(cell.center.x, cell.center.y, 8 * CONFIG.FPS));
})

gameEngine.start(document.getElementById('the-canvas'), window);