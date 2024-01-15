export function ImageSrc(src) {
  const img = new Image();
  img.src = src;
  return img;
}

// https://stackoverflow.com/a/44694267
export function loadImage(url) {
  return new Promise(r => { let i = new Image(); i.onload = (() => r(i)); i.src = url; });
}