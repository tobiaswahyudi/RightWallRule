import gameEngine from "./core/engine.js";
import { Wall } from "./entities/wall.js";
import { CONFIG, COLORS, SIZES } from "./config.js";
import { EFFECT_LAYERS, RectEffect } from "./entities/effect.js";
import { thunk } from "./utils/thunk.js";
import { coinFlip } from "./utils/random.js";
import { Spawner } from "./entities/enemies/spawner.js";

// Walls
gameEngine.maze.generateWalls().forEach(([xStart, yStart, xEnd, yEnd]) => {
  gameEngine.spawnEntity("wall", new Wall(xStart * SIZES.mazeCell, yStart * SIZES.mazeCell, xEnd * SIZES.mazeCell, yEnd  * SIZES.mazeCell));
})

const mazeTotalSize = CONFIG.mazeGridSize * SIZES.mazeCell;

gameEngine.spawnEffect(EFFECT_LAYERS.under, new RectEffect(-window.innerWidth, 0, -window.innerHeight, mazeTotalSize + window.innerHeight, thunk, COLORS.enemy));
gameEngine.spawnEffect(EFFECT_LAYERS.under, new RectEffect(-window.innerWidth, mazeTotalSize + window.innerWidth, -window.innerHeight, 0, thunk, COLORS.enemy));

gameEngine.spawnEffect(EFFECT_LAYERS.under, new RectEffect(mazeTotalSize, mazeTotalSize + window.innerWidth, -window.innerHeight, mazeTotalSize + window.innerHeight, thunk, COLORS.enemy));
gameEngine.spawnEffect(EFFECT_LAYERS.under, new RectEffect(-window.innerWidth, mazeTotalSize + window.innerWidth, mazeTotalSize, mazeTotalSize + window.innerHeight, thunk, COLORS.enemy));

// We need like... Let's say 16 dead ends
if(gameEngine.maze.deadEnds.length < 16) {
  // Statistically unlikely, but possible for sure. Start over :)
  window.location.reload();
}
// Shuffle dead ends
gameEngine.maze.deadEnds.sort((a,b) => coinFlip(0.5) ? -1 : 1);
// Take 1 for player location
gameEngine.player.position.x = gameEngine.maze.deadEnds[0].center.x;
gameEngine.player.position.y = gameEngine.maze.deadEnds[0].center.y;
// Take 10 for spawners
gameEngine.maze.deadEnds.slice(1, 11).forEach(cell => {
  gameEngine.spawnEntity("spawner", new Spawner(cell.center.x, cell.center.y, 8 * CONFIG.FPS));
})

gameEngine.start(document.getElementById('the-canvas'), window);