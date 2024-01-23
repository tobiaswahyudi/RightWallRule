import { SIZES } from "../config.js";

export function getMazeRowCol(position) {
  const myGridRow = Math.floor(position.y / SIZES.mazeCell);
  const myGridCol = Math.floor(position.x / SIZES.mazeCell);
  return [myGridRow, myGridCol];
}

