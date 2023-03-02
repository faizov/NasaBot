import { Api, GrammyError } from "grammy";
import schedule from "node-schedule";
import { fetchApod, fetchRandomApod } from "../data/apod";

import fetch from "node-fetch";

const sendPhotoToChats = async (
  bot: Api,
  chatsId: number[],
  url: string,
  message: string
) => {
  try {
    for (let index = 0; index < chatsId.length; index++) {
      const id = chatsId[index];

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

export const cronApod = (bot: Api) => {
  const hour = 10;
  const minute = 29;
  const scheduleTime = `${minute} ${hour} * * *`;

  return schedule.scheduleJob("*/1 * * * *", async () => {
    try {
      console.log("Start cron Apod");
      const apod = await fetchRandomApod();

      const chatsId = [-666404832];

      if (apod) {
        const { title, explanation, hdurl, url, copyright, date } = apod[0];

        const imageUrl = hdurl ? hdurl : url;

        const response = hdurl ? await fetch(hdurl) : undefined;
        const buffer = response ? await response.buffer() : undefined;
        const size = buffer && buffer.byteLength;

        const message = `<b><a href="${imageUrl}">${title}</a></b> \n \n<i>${date}</i> \n \n${explanation} \n \n${
          copyright ? `<b>Copyright:</b> ${copyright}` : " "
        } `;

        if (!hdurl || !buffer || !size) {
          console.log('apod', apod)
          throw new Error("Unable to fetch image data");
        }

        await sendPhotoToChats(bot, chatsId, url, message);
      }
    } catch (error) {
      console.log("Error sending NASA APOD:", error);
    }
  });
};
