/**************************************
 * pathfinding.js
 * 
 * Pathfinds.
 **************************************/
function computeNavDistancesTo(navPoints, gridCell) {
  const pq = new MinHeap();
  navPoints.forEach(point => {
    point.visited = false;
    point.distanceToPlayer = 0;
    point.prev = null;
  });

  if(gridCell.northPoint) pq.push({key: 0, point: gridCell.northPoint, prev: null});
  if(gridCell.southPoint) pq.push({key: 0, point: gridCell.southPoint, prev: null});
  if(gridCell.eastPoint) pq.push({key: 0, point: gridCell.eastPoint, prev: null});
  if(gridCell.westPoint) pq.push({key: 0, point: gridCell.westPoint, prev: null});

  while(!pq.empty()) {
  // for(let i = 0; i < 10; i++) {
    const {key, point, prev} = pq.pop();
    if(point.visited) continue;
    console.log(point);
    point.visited = true;
    point.distanceToPlayer = key;
    point.prev = prev;

    point.neighbors.forEach(nbor => {
      if(nbor.visited) return;
      pq.push({key: key + point.position.delta(nbor.position).magnitude, point: nbor, prev: point});
    })
    console.log(pq);
  }
}