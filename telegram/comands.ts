import { fetchApod, fetchRandomApod } from "../data/apod";
import { fetchRandomMars } from "../data/mars";

import {
  CallbackQueryContext,
  CommandContext,
  Context,
  GrammyError,
  InlineKeyboard,
} from "grammy";
import fetch from "node-fetch";

import { Chat } from "grammy/out/types.node";

import { chatsDb, statsDb } from "./firebase";
import { TChat } from "../types";

export const initUser = async (chat: Chat) => {
  if (chat) {
    const chatRef = chatsDb.doc(`chat-${chat.id}`);
    const dataChat = await chatRef.get();
    const isStartPhotoDay = Boolean(dataChat.data()?.isStartPhotoDay);

    const chatInfo: TChat = {
      type: chat.type,
      isStartPhotoDay: isStartPhotoDay,
      id: chat.id,
    };

    await chatRef.set(chatInfo);

    const countUsers = await chatsDb.get().then((snap) => {
      return snap.size;
    });

    const countUserObj = {
      count: countUsers,
    };

    await statsDb.doc(`users`).set(countUserObj);
  }
};

export const removeUser = async (id: number) => {
  const chatRef = chatsDb.doc(`chat-${id}`);
  await chatRef.delete();
};

export const startCommand = async (ctx: CommandContext<Context>) => {
  const usersRef = statsDb.doc(`users`);
  const dataChat = await usersRef.get();
  const users = dataChat.data();

  if (ctx.from?.id === parseInt(process.env.ID_ADMIN!)) {
    return ctx.reply(`Users: ${users?.count}`);
  } else {
    return ctx.reply(
      "Hello " +
        ctx.from?.first_name +
        `! \n\nThe bot is currently under development.\n\nCommand List: \n\n/photo_day - Astronomy Picture of the Day\n\n/mars - Random photo from Mars\n\n/photo_day_start - Daily newsletter Picture of the day at 12 noon Moscow time\n\n/photo_day_stop - Disable Newsletter \n\nChannel Astronomy Picture of the Day: @nasa_channel_bot\n\ngithub.com/faizov/NasaBot`
    );
  }
};

export const apodCommand = async (ctx: CommandContext<Context>) => {
  const apod = await fetchApod();

  if (apod) {
    const { title, explanation, hdurl, url, copyright, date } = apod;

    // CHECK size image
    // const response = hdurl ? await fetch(hdurl) : undefined;
    // const buffer = response ? await response.buffer() : undefined;
    // const size = buffer && buffer.byteLength;

    const message = `<b><a href="${
      hdurl || url
    }">${title}</a></b> \n \n<i>${date}</i> \n \n${explanation} \n \n${
      copyright ? `<b>Copyright:</b> ${copyright}` : " "
    } `;

    try {
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

export const randomMarsCommand = async (
  ctx: CommandContext<Context> | CallbackQueryContext<Context>
) => {
  const mars = await fetchRandomMars();

  const inlineKeyboard = new InlineKeyboard().text(
    "Random Mars",
    "click-random-mars"
  );

  try {
    if (mars) {
      ctx.replyWithPhoto(mars.img_src, {
        caption: `<b>Earth date: ${mars.earth_date}</b>\n<b>Sol: ${mars.sol}</b>`,
        parse_mode: "HTML",
        reply_markup: inlineKeyboard,
      });
    }
  } catch (error) {
    console.log("error", error);
  }
};
