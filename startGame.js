gameEngine.player = player;
gameEngine.collisionMap.registerEntity(player);

gameEngine.input = new GameInputManager(); 

gameEngine.spawnEntity("wall", new Wall(-500, -500, -500, 500));
gameEngine.spawnEntity("wall", new Wall(500, 500, -500, 500));
gameEngine.spawnEntity("wall", new Wall(-500, 500, 500, 500));
gameEngine.spawnEntity("wall", new Wall(-500, 500, -500, -500));

for(let i = 0; i < 30; i++)
  gameEngine.spawnEntity("enemy", new CrawlerEnemy((Math.random()-0.5) * 2 * 400, (Math.random()-0.5) * 2 * 400));

gameEngine.start(document.getElementById('the-canvas'), window);