gameEngine.player = player;
gameEngine.collisionMap.registerEntity(player);

gameEngine.input = new GameInputManager(); 

gameEngine.entities.wall.push(new Wall(-250, -250, -250, 250));
gameEngine.entities.wall.push(new Wall(250, 250, -250, 250));
gameEngine.entities.wall.push(new Wall(-250, 250, 250, 250));
gameEngine.entities.wall.push(new Wall(-250, 250, -250, -250));

for(let i = 0; i < 20; i++)
  gameEngine.spawnEntity("enemy", new CrawlerEnemy((Math.random()-0.5) * 2 * 200 - 500, (Math.random()-0.5) * 2 * 200));

gameEngine.start(document.getElementById('the-canvas'), window);