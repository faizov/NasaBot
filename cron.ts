import { Api, GrammyError } from "grammy";
import schedule from "node-schedule";
import { fetchApod, fetchRandomApod } from "./data/apod";
import { chatsDb } from "./firebase";

import fetch from "node-fetch";
import { fetchRandomMars } from "./data/mars";

const sendPhotoToChats = async (
  bot: Api,
  chatsId: number[],
  url: string,
  message: string,
  media: string
) => {
  try {
    chatsId.forEach(async (id) => {
      try {
        if (media === "video") {
          return await bot.sendMessage(id, message, {
            parse_mode: "HTML",
          });
        }

        await bot.sendPhoto(id, url, {
          caption: message,
          parse_mode: "HTML",
        });
      } catch (error) {
        console.log("error", error);
      }
    });
  } catch (error) {
    if (error instanceof GrammyError) {
      if (error.description === "Bad Request: message caption is too long") {
        chatsId.forEach(async (id) => {
          try {
            await bot.sendMessage(id, message, {
              parse_mode: "HTML",
            });
          } catch (error) {
            console.log("error", error);
          }
        });
      }
    }
  }
};

export const cronApod = async (bot: Api) => {
  return schedule.scheduleJob("0 12 * * *", async () => {
    const snapshot = await chatsDb.get();
    const channels = -1001529487393;
    let chats: number[] = [channels];

    snapshot.forEach((doc: any) => {
      const isStartPhotoDay = doc.data().isStartPhotoDay;
      const chatId = doc.data().chatId;
      if (isStartPhotoDay && chatId) {
        chats.push(chatId);
      }
    });

    try {
      console.log("Start cron Apod");
      const apod = await fetchApod();

      if (apod) {
        const { title, explanation, hdurl, url, copyright, date } = apod;

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

        await sendPhotoToChats(bot, chats, url, message, apod.media_type);
      }
    } catch (error) {
      console.log("Error sending NASA APOD:", error);
    }
  });
};

export const cronMars = async (bot: Api) => {
  schedule.scheduleJob("0 * * * *", async () => {
    const marsPhoto = await fetchRandomMars();
    if (marsPhoto) {
      await bot.sendPhoto(-1001761889046, marsPhoto.img_src, {
        caption: `Earth date: ${marsPhoto.earth_date}\nSol: ${marsPhoto.sol}`,
        parse_mode: "HTML",
      });
    }
  });
};
