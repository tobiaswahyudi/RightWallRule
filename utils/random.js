export function coinFlip(prob) {
  return Math.random() < prob;
}

export function randomChoice(container, containerSize) {
  return [...container][Math.trunc(Math.random() * containerSize)];
}

export function normalSample() {
  return Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());
}

export function randInt(max) {
  return Math.floor(Math.random() * max);
}

export default {
  coinFlip,
  randomChoice,
  normalSample,
};