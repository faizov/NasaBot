import { CommandContext, Context } from "grammy";

import { Chat } from "grammy/out/types.node";

import { chatsDb, statsDb } from "./../firebase";
import { TChat } from "../types";

export const initUser = async (chat: Chat) => {
  console.log('chat.id', chat.id);
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

  await chatRef.delete().then(async () => {
    const countUsers = await chatsDb.get().then((snap) => {
      return snap.size;
    });

    const countUserObj = {
      count: countUsers,
    };

    await statsDb.doc(`users`).set(countUserObj);
  });
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
