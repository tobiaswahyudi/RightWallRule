function coinFlip(prob) {
  return Math.random() < prob;
}

function randomChoice(container, containerSize) {
  return [...container][Math.trunc(Math.random() * containerSize)];
}

function normalSample() {
  return Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());
}