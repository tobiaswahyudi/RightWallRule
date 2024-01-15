import { Entity } from "./entity.js";
import { RectShapedSprite } from "./shapes.js";

import gameEngine from "../core/engine.js";
import { Player } from "./player.js";

import { Spawner } from "./enemies/spawner.js";
import { COLORS, CONFIG, SIZES } from "../config.js";
import { EFFECT_LAYERS } from "../effects/effect.js";
import { AbstractEffect } from "../effects/abstractEffect.js";
import { VFXFlare } from "../effects/vfx/flare.js";
import { computeChestToPlayerPaths, dirIndexGap } from "../maze/pathfinding.js";

const CHEST_PATH_GAP = 10;

export class Chest extends Entity {
  constructor(x, y, idx) {
    super(x, y);

    const myGridRow = Math.floor(this.position.y / SIZES.mazeCell);
    const myGridCol = Math.floor(this.position.x / SIZES.mazeCell);

    this.cell = gameEngine.maze.grid[myGridRow][myGridCol];

    this.innerRadius = 10;
    this.outerRadius = 55;
    this.opened = false;
    this.shinePath = new Path2D(`
      M ${this.innerRadius * Math.cos(0)}, ${this.innerRadius * Math.sin(0)}
      L ${(this.innerRadius + this.outerRadius) * Math.cos(1/6 * Math.PI)}, ${(this.innerRadius + this.outerRadius) * Math.sin(1/6 * Math.PI)}
      L ${this.innerRadius * Math.cos(1/3 * Math.PI)}, ${this.innerRadius * Math.sin(1/3 * Math.PI)}
      L ${(this.innerRadius + this.outerRadius) * Math.cos(3/6 * Math.PI)}, ${(this.innerRadius + this.outerRadius) * Math.sin(3/6 * Math.PI)}
      L ${this.innerRadius * Math.cos(2/3 * Math.PI)}, ${this.innerRadius * Math.sin(2/3 * Math.PI)}
      L ${(this.innerRadius + this.outerRadius) * Math.cos(5/6 * Math.PI)}, ${(this.innerRadius + this.outerRadius) * Math.sin(5/6 * Math.PI)}
      L ${this.innerRadius * Math.cos(3/3 * Math.PI)}, ${this.innerRadius * Math.sin(3/3 * Math.PI)}
      L ${(this.innerRadius + this.outerRadius) * Math.cos(7/6 * Math.PI)}, ${(this.innerRadius + this.outerRadius) * Math.sin(7/6 * Math.PI)}
      L ${this.innerRadius * Math.cos(4/3 * Math.PI)}, ${this.innerRadius * Math.sin(4/3 * Math.PI)}
      L ${(this.innerRadius + this.outerRadius) * Math.cos(9/6 * Math.PI)}, ${(this.innerRadius + this.outerRadius) * Math.sin(9/6 * Math.PI)}
      L ${this.innerRadius * Math.cos(5/3 * Math.PI)}, ${this.innerRadius * Math.sin(5/3 * Math.PI)}
      L ${(this.innerRadius + this.outerRadius) * Math.cos(11/6 * Math.PI)}, ${(this.innerRadius + this.outerRadius) * Math.sin(11/6 * Math.PI)}
      L ${this.innerRadius * Math.cos(6/3 * Math.PI)}, ${this.innerRadius * Math.sin(6/3 * Math.PI)}
      Z
    `);

    this.pathColor = (opacity) => `hsla(${36 * idx} 100% 60% / ${opacity})`;
    this.shape = new RectShapedSprite(x - 10, x + 10, y - 10, y + 10, this.pathColor(1));
    this.effect = new AbstractEffect(x, y);
    gameEngine.spawnEffect(EFFECT_LAYERS.under, this.effect, -1);

    this.seenByPlayer = false;
    this.renderPath = false;
    this.idx = idx;
    this.startRenderPathTick = 0;
  }

  tick(ticks) {
    if(gameEngine.screenCells.has(this.cell) && !this.seenByPlayer) {
      this.seenByPlayer = true;
      gameEngine.seenChests.add(this);
      VFXFlare(gameEngine.player.position, this.position, this.pathColor(0.8), (flareDespawnTicks) => {
        this.renderPath = true;
        this.startRenderPathTick = flareDespawnTicks;
        computeChestToPlayerPaths(gameEngine.seenChests);
        gameEngine.hud.log(`Tracked the <span style="color: ${this.pathColor(1)};">${COLORS.hueNames[36 * this.idx]}</span> crystal!`, flareDespawnTicks);
        gameEngine.hud.log("&nbsp;", gameEngine.gameTicks);
      })
    }

    if(this.renderPath) {
      let lineLength = (ticks - this.startRenderPathTick) * 2 * SIZES.mazeCell / CONFIG.FPS;
      const coords = [];
      let myCell = this.cell;
      let currentCoords = myCell.center;
      coords.push(currentCoords);
      let lastOffset = 0;
      let lastDir = myCell.nextCellDir;
      myCell = myCell.nextCell;
      while (myCell) {
        let nextLocation = myCell.center.copy;
        const currentOffset = (myCell.chestPaths.indexOf(this) - (myCell.chestPaths.length - 1)/ 2) * CHEST_PATH_GAP;
        let currentAxis = null;
        let currentAxisFactor = 1;
        const currentDir = myCell.nextCellDir;
        if(currentDir == 'E') { currentAxis = 'y'; currentAxisFactor =  1; } else
        if(currentDir == 'W') { currentAxis = 'y'; currentAxisFactor = -1; } else
        if(currentDir == 'S') { currentAxis = 'x'; currentAxisFactor = -1; } else
        if(currentDir == 'N') { currentAxis = 'x'; currentAxisFactor =  1; }

        const otherAxis = currentAxis == 'x' ? 'y' : 'x';
        const otherAxisFactor = currentAxis == 'x' ? -1 : 1;

        nextLocation[currentAxis] += currentAxisFactor * currentOffset;
        if(dirIndexGap(lastDir, currentDir) == 0) {
          nextLocation[otherAxis] += currentAxisFactor * otherAxisFactor * lastOffset;
        } else if(dirIndexGap(lastDir, currentDir) == 1) {
          nextLocation[otherAxis] += currentAxisFactor * otherAxisFactor * currentOffset;
        } else if(dirIndexGap(lastDir, currentDir) == 2) {
          nextLocation[otherAxis] -= currentAxisFactor * otherAxisFactor * lastOffset;
        }

        lastOffset = currentOffset;
        lastDir = currentDir;

        if(lineLength > SIZES.mazeCell) {
          lineLength -= SIZES.mazeCell;
        } else {
          coords.push(nextLocation.delta(currentCoords).scale(lineLength / SIZES.mazeCell).add(currentCoords));
          lineLength = 0;
          break;
        }
        currentCoords = nextLocation;
        myCell = myCell.nextCell;
        coords.push(currentCoords);
      }
      const nextLocation = currentCoords.copy;
      if(lastDir == 'W' || lastDir == 'E') {
        nextLocation.x = gameEngine.player.position.x;
      } else {
        nextLocation.y = gameEngine.player.position.y;
      }
      const deltaLen = nextLocation.delta(currentCoords).magnitude;
      if(lineLength > deltaLen) {
        coords.push(nextLocation);
        coords.push(gameEngine.player.position);
      } else {
        coords.push(nextLocation.delta(currentCoords).scale(lineLength / deltaLen).add(currentCoords));
        lineLength = 0;
      }

      if(coords.length < 2) return;

      this.effect.shapeConstructor = () => new Path2D(`M ${coords.map(vec => `${vec.x}, ${vec.y}`).join(" L ")}`);
      this.effect.stroke = this.pathColor(0.5);
      this.effect.strokeWidth = 2;
    }
  }

  render(context, ticks) {
    context.fillStyle = this.pathColor(0.5);
    const yellowStar = new Path2D();
    yellowStar.addPath(this.shinePath, new DOMMatrix().translate(this.position.x, this.position.y).rotate((ticks / 2.1) + 30).scale(0.7 + 0.2 * Math.sin(ticks / 30)));
    context.fill(yellowStar);
    context.fillStyle = "#FFFFDD99";
    const whiteStar = new Path2D();
    whiteStar.addPath(this.shinePath, new DOMMatrix().translate(this.position.x, this.position.y).rotate(ticks / 2.1).scale(0.85 + 0.15 * Math.sin(ticks / 30)));
    context.fill(whiteStar);
    this.shape.render(context);
  }

  collide(rhs) {
    if(rhs instanceof Player && !this.opened) {
      gameEngine.paused = true;
      gameEngine.uiManager.showChestDialog(gameEngine.inventoryManager, () => {
        gameEngine.deleteEntity(this);
        gameEngine.deleteEffect(this.effect);
        gameEngine.paused = false;

        gameEngine.claimedChests++;

        const deletedChests = [];

        for(let i = 0; i < gameEngine.claimedChests; i++) {
          const unlucky = [...gameEngine.entities.chest][0];
          gameEngine.deleteEntity(unlucky);
          gameEngine.deleteEffect(unlucky.effect);
          gameEngine.spawnEntity("spawner", new Spawner(unlucky.position.x, unlucky.position.y, 8 * CONFIG.FPS));
          deletedChests.push(`<span style="color: ${unlucky.pathColor};">${COLORS.hueNames[36 * unlucky.idx]}</span>`);
        }
        if(deletedChests.length == 0) {
          gameEngine.hud.log(`You grabbed the <span style="color: ${this.pathColor};">${COLORS.hueNames[36 * this.idx]}</span> crystal!`, gameEngine.gameTicks);
          gameEngine.hud.log(`You feel an ominous presence...`, gameEngine.gameTicks);
        } else if(deletedChests.length == 1) {
          gameEngine.hud.log(`Snatching the <span style="color: ${this.pathColor};">${COLORS.hueNames[36 * this.idx]}</span> crystal angered the labyrinth...`, gameEngine.gameTicks);
          gameEngine.hud.log(`The ${deletedChests[0]} crystal became infected.`, gameEngine.gameTicks);
        } else {
          gameEngine.hud.log(`Snatching the <span style="color: ${this.pathColor};">${COLORS.hueNames[36 * this.idx]}</span> crystal stoked the labyrinth's fury...`, gameEngine.gameTicks);
          gameEngine.hud.log(`The ${deletedChests.join(', ')} crystals now spread the infection!`, gameEngine.gameTicks);
        }
        gameEngine.hud.log("&nbsp;", gameEngine.gameTicks);
      });
      this.opened = true;
    }
  }
}