function coinFlip(prob) {
  return Math.random() < prob;
}

function randomChoice(container, containerSize) {
  return [...container][Math.trunc(Math.random() * containerSize)];
}