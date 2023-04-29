import { fetchApod, fetchRandomApod } from "../../data/apod";

import {
  CallbackQueryContext,
  CommandContext,
  Context,
  GrammyError,
  InlineKeyboard,
} from "grammy";
import fetch from "node-fetch";
import { chatsDb } from "firebase";

export const apodCommand = async (ctx: CommandContext<Context>) => {
  const apod = await fetchApod();

  if (apod) {
    const { title, explanation, hdurl, url, copyright, date, media_type } =
      apod;

    // CHECK size image
    const response = hdurl ? await fetch(hdurl) : undefined;
    const buffer = response ? await response.buffer() : undefined;
    const size = buffer && buffer.byteLength;

    const imageUrl = size && size <= 130000 ? hdurl : url;
    const titlePost = title ? title : url;

    const message = `<b><a href="${imageUrl}">${titlePost}</a></b> \n \n<i>${date}</i> \n \n${explanation} \n \n${
      copyright ? `<b>Copyright:</b> ${copyright}` : " "
    } `;

    try {
      if (media_type === "video") {
        return await ctx.reply(message, {
          parse_mode: "HTML",
        });
      }
      await ctx.replyWithPhoto(url, {
        caption: message,
        parse_mode: "HTML",
      });
    } catch (error) {
      if (error instanceof GrammyError) {
        if (error.description === "Bad Request: message caption is too long") {
          await ctx.reply(message, {
            parse_mode: "HTML",
          });
        }
      }
    }
  }
};

export const randomApodCommand = async (
  ctx: CommandContext<Context> | CallbackQueryContext<Context>
) => {
  const apod = await fetchRandomApod();
  console.log('apod', apod)
  if (apod && apod[0]) {
    const { title, explanation, hdurl, url, copyright, date } = apod[0];

    const inlineKeyboard = new InlineKeyboard().text(
      "Random apod",
      "click-random-apod"
    );

    const message = `<b><a href="${
      hdurl || url
    }">${title}</a></b> \n \n<i>${date}</i> \n \n${explanation} \n \n${
      copyright ? `<b>Copyright:</b> ${copyright}` : " "
    } `;

    try {
      await ctx.replyWithPhoto(url, {
        caption: message,
        parse_mode: "HTML",
        reply_markup: inlineKeyboard,
      });
    } catch (error) {
      if (error instanceof GrammyError) {
        if (error.description === "Bad Request: message caption is too long") {
          await ctx.reply(message, {
            parse_mode: "HTML",
            reply_markup: inlineKeyboard,
          });
        }
      }
    }
  }

  if (apod && apod[0].error) {
    ctx.reply(apod[0].error.message);
  }
};

export const photoDayStart = async (
  ctx: CommandContext<Context> | CallbackQueryContext<Context>
) => {
  const chatRef = chatsDb.doc(`chat-${ctx.chat?.id}`);
  const dataChat = await chatRef.get();
  const isStartPhotoDay = dataChat.exists
    ? dataChat.data()?.isStartPhotoDay
    : false;
  console.log("isStartPhotoDay", isStartPhotoDay);

  await chatRef.set({ isStartPhotoDay: true }, { merge: true });
  if (!isStartPhotoDay) {
    ctx.reply(
      "Now the photo of the day will come every day at 12:00 Moscow time."
    );
  } else {
    ctx.reply("This command is already enabled!");
  }
};

export const photoDayStop = async (
  ctx: CommandContext<Context> | CallbackQueryContext<Context>
) => {
  const chatRef = chatsDb.doc(`chat-${ctx.chat?.id}`);
  const dataChat = await chatRef.get();
  const isStartPhotoDay = dataChat.exists
    ? dataChat.data()?.isStartPhotoDay
    : false;

  await chatRef.set({ isStartPhotoDay: false }, { merge: true });

  if (!isStartPhotoDay) {
    ctx.reply("This command is already disabled!");
  } else {
    ctx.reply("The photo of the day will NOT come every day.");
  }
};
