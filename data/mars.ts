import fetch from "node-fetch";
import { config } from "dotenv";
import sizeOf from "image-size";

import { TMars } from "../types";

config();

type TMarsPhotos = {
  photos: TMars[];
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getRandomDate(): string {
  const start = new Date(2012, 7, 6); // start mission Curiosity
  const end = new Date();

  const randomDate = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );

  return `${randomDate.getFullYear()}-${
    randomDate.getMonth() + 1
  }-${randomDate.getDate()}`;
}

const getImageSize = async (imageUrl: string) => {
  const response = await fetch(imageUrl);
  const buffer = await response.buffer();
  const dimensions = sizeOf(buffer);
  return { width: dimensions.width, height: dimensions.height };
};

export const fetchRandomMars = async () => {
  while (true) {
    const randomDate = getRandomDate();
    const photoMarsUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=${randomDate}&camera=MAST&api_key=${process.env.API_KEY}`;
    const mars = (await fetch(photoMarsUrl).then((res) =>
      res.json()
    )) as TMarsPhotos;

    try {
      if (mars.photos.length === 0) {
        console.log(`No photos found for ${randomDate}, trying again...`);
        delay(2000);
        continue;
      }

      for (const photo of mars.photos) {
        const imageSize = await getImageSize(photo.img_src);

        if (
          imageSize.height &&
          imageSize.width &&
          imageSize.height > 300 &&
          imageSize.width > 300
        ) {
          return photo;
        }
      }

      console.log("No photo found with the required size, trying again...");
    } catch (error) {
      console.log("error", error);
    }
  }
};
