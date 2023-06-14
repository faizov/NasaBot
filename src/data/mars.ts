import axios from "axios";
import { config } from "dotenv";
import { checkImageColor } from "../utils/checkImage";

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

export const fetchRandomMars = async () => {
  let page = 1;
  let randomDate = getRandomDate();

  while (true) {
    const photoMarsUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=${randomDate}&page=${page}&camera=MAST&api_key=${process.env.API_KEY}`;

    const { data: mars } = await axios.get<TMarsPhotos>(photoMarsUrl, {
      timeout: 5000,
    });

    try {
      console.log("mars.photos.length", mars.photos.length);

      if (!mars || mars.photos.length === 0) {
        console.log(`No photos found for ${randomDate}, trying again...`);
        await delay(2000);
        randomDate = getRandomDate();
        page = 1;
        continue;
      }

      const promises = mars.photos.map(async (marsObj) => {
        const colorImg = await checkImageColor(marsObj.img_src);
      
        if (colorImg) {
          return marsObj;
        }
      });
      
      const marsList: TMars[] = [];
      
      (await Promise.allSettled(promises)).forEach((result) => {
        if (result.status === "fulfilled" && result.value) {
          marsList.push(result.value);
        }
      });
      
      const randomMars = marsList[Math.floor(Math.random() * marsList.length)];
      
      if (marsList.length === 0 || !randomMars) {
        console.log("No photo found with the required size, trying again...");
        page++;
        delay(2000);
        continue;
      }

      return randomMars;
    } catch (error) {
      console.log("error", error);
    }
  }
};

