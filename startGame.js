gameEngine.player = player;
gameEngine.input = new GameInputManager(); 

gameEngine.entities.walls.push(new Wall(-250, -250, -250, 250));
gameEngine.entities.walls.push(new Wall(250, 250, -250, 250));
gameEngine.entities.walls.push(new Wall(-250, 250, 250, 250));
gameEngine.entities.walls.push(new Wall(-250, 250, -250, -250));

for(let i = 0; i < 20; i++)
  gameEngine.entities.enemies.push(new CrawlerEnemy((Math.random()-0.5) * 2 * 200, (Math.random()-0.5) * 2 * 200));

gameEngine.start(document.getElementById('the-canvas'), window);