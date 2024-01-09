import { Wall } from "./wall.js";
import { Bullet } from "./bullet.js";
import { Player } from "./player.js";
import { Turret } from "../turrets/turret.js";

export function mutualCollide(wallCollisions, entity1, entity2) {
  const collisionPoint = entity1.shape.collisionCheck(entity2.shape);
  if(!collisionPoint) return;
  if (entity1 instanceof Wall && entity2 instanceof Wall) return;
  if(entity1 instanceof Bullet && entity2 instanceof Bullet) return;
  if((entity1 instanceof Player && entity2 instanceof Bullet) || (entity1 instanceof Bullet && entity2 instanceof Player)) return;
  if((entity1 instanceof Turret && entity2 instanceof Bullet) || (entity1 instanceof Bullet && entity2 instanceof Turret)) return;

  // Log all wall collisions
  if (entity1 instanceof Wall || entity2 instanceof Wall) {
    const nonWall = entity1 instanceof Wall ? entity2 : entity1;
    wallCollisions.push([nonWall, collisionPoint]);
  }
  entity1.collide(entity2, collisionPoint);
  entity2.collide(entity1, collisionPoint);
}