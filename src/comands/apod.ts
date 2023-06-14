import { fetchApod, fetchDateApod, fetchRandomApod } from "../data/apod";

import {
  CallbackQueryContext,
  CommandContext,
  Context,
  InlineKeyboard,
} from "grammy";

import { chatsDb } from "../service/firebase";
import { sendApod } from "../service/sendApod";

export const apodCommand = async (ctx: CommandContext<Context>) => {
  const apod = await fetchApod();

  if (apod) {
    sendApod(apod, ctx);
  }
};

export const randomApodCommand = async (
  ctx: CommandContext<Context> | CallbackQueryContext<Context>
) => {
  const apod = await fetchRandomApod();

  if (apod && apod[0]) {
    const inlineKeyboard = new InlineKeyboard().text(
      "Random apod",
      "click-random-apod"
    );

    sendApod(apod[0], ctx, inlineKeyboard);
  }

  if (apod && apod[0].error) {
    ctx.reply(apod[0].error.message);
  }
};

export const dateApodCommand = async (ctx: CommandContext<Context>) => {
  const item = ctx.match;

  const apod = await fetchDateApod(item);

  if (apod && apod.error) {
    return ctx.reply(apod.error.message);
  }

  if (apod) {
    try {
      if (apod.code === 400) {
        throw Error;
      }
      sendApod(apod, ctx);
    } catch (error) {
      ctx.reply(
        "Unfortunately, there is no such photo, try another date. Required format 'y-m-d'"
      );
    }
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

  await chatRef.set({ isStartPhotoDay: true }, { merge: true });
  if (!isStartPhotoDay) {
    ctx.reply("Now the photo of the day will come every day at 12:00 UTC.");
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
