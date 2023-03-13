import fetch from "node-fetch";
import { createCanvas, loadImage } from "canvas";

export async function checkImageColor(url: string) {
  const response = await fetch(url);
  const buffer = await response.buffer();
  const img = await loadImage(buffer);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, img.width, img.height);
  const data = imageData.data;

  let isBlackAndWhite = true;
  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];
    if (red !== green || red !== blue || green !== blue) {
      isBlackAndWhite = false;
      break;
    }
  }

  if (isBlackAndWhite || img.width < 600 || img.height < 600) {
    // console.log("Это черно-белое изображение");
    return false;
  } else {
    // console.log("Это цветное изображение");
    return true;
  }
}
