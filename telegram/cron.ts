import { Api, GrammyError } from "grammy";
import schedule from "node-schedule";
import { fetchApod, fetchRandomApod } from "../data/apod";
import { chatsDb } from "./firebase";

import fetch from "node-fetch";
import { fetchRandomMars } from "../data/mars";

const sendPhotoToChats = async (
  bot: Api,
  chatsId: number[],
  url: string,
  message: string,
  media: string
) => {
  try {
    for (let index = 0; index < chatsId.length; index++) {
      const id = chatsId[index];

      if (media === "video") {
        return await bot.sendMessage(id, message, {
          parse_mode: "HTML",
        });
      }

      await bot.sendPhoto(id, url, {
        caption: message,
        parse_mode: "HTML",
      });
    }
  } catch (error) {
    if (error instanceof GrammyError) {
      if (error.description === "Bad Request: message caption is too long") {
        for (let index = 0; index < chatsId.length; index++) {
          const id = chatsId[index];

          await bot.sendMessage(id, message, {
            parse_mode: "HTML",
          });
        }
      }
    }
  }
};

export const cronApod = async (bot: Api) => {
  const hour = 10;
  const minute = 29;
  const scheduleTime = `${minute} ${hour} * * *`;

  return schedule.scheduleJob("0 9 * * *", async () => {
    try {
      console.log("Start cron Apod");
      const apod = await fetchRandomApod();

      if (apod) {
        const chatsId = [-666404832];
        const { title, explanation, hdurl, url, copyright, date } = apod[0];

        // CHECK size image
        const response = hdurl ? await fetch(hdurl) : undefined;
        const buffer = response ? await response.buffer() : undefined;
        const size = buffer && buffer.byteLength;

        const imageUrl = size && size <= 130000 ? hdurl : url;
        const titlePost = title ? title : url;

        const message = `<b><a href="${imageUrl}">${titlePost}</a></b> \n \n<i>${date}</i> \n \n${explanation} \n \n${
          copyright ? `<b>Copyright:</b> ${copyright}` : " "
        } `;

        if (!hdurl || !buffer || !size) {
          console.log("apod", apod);
          throw new Error("Unable to fetch image data");
        }

        await sendPhotoToChats(bot, chatsId, url, message, apod[0].media_type);
      }
    } catch (error) {
      console.log("Error sending NASA APOD:", error);
    }
  });
};

export const cronMars = async (bot: Api) => {
  schedule.scheduleJob("*/1 * * * *", async () => {
    const marsPhoto = await fetchRandomMars();
    if (marsPhoto) {
      await bot.sendPhoto(-1001761889046, marsPhoto.img_src, {
        caption: `Earth date: ${marsPhoto.earth_date}\nSol: ${marsPhoto.sol}`,
        parse_mode: "HTML",
      });
    }
  });
};
