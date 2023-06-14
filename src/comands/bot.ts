import { CommandContext, Context } from "grammy";

import { Chat } from "grammy/out/types.node";

import { chatsDb, statsDb } from "../service/firebase";
import { TChat } from "../types";
import { getUserToDailyUsage } from "../service/statsUser";

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

  await chatRef.delete().then(async () => {
    const countUsers = await chatsDb.get().then((snap) => {
      return snap.size;
    });

    const countUserObj = {
      count: countUsers,
    };
    console.log("remove countUserObj", countUserObj.count);
    await statsDb.doc(`users`).set(countUserObj);
  });
};

export const startCommand = async (ctx: CommandContext<Context>) => {
  const trueChatsQuery = chatsDb.where("isStartPhotoDay", "==", true);
  const countActiveDailyApod = await trueChatsQuery.get();
  const countUserToday = await getUserToDailyUsage();

  const usersRef = statsDb.doc(`users`);
  const dataChat = await usersRef.get();
  const users = dataChat.data();

  if (ctx.from?.id === parseInt(process.env.ID_ADMIN!)) {
    return ctx.reply(
      `Users: ${users?.count}\n\nActive Daily apod: ${countActiveDailyApod.size}\n\nCount User Today: ${countUserToday}`
    );
  } else {
    return ctx.reply(
      "Hello " +
        ctx.from?.first_name +
        `! \n\nThe bot is currently under development.\n\nCommand List: \n\n/photo_day - Astronomy Picture of the Day\n\n/random_apod - Random APOD\n\n/random_mars - Random photo from Mars\n\n/photo_day_start - Daily newsletter Picture of the day at 09:00 UTC\n\n/photo_day_stop - Disable Newsletter \n\nChannel Astronomy Picture of the Day: @nasa_channel_apod\n\nSupport the developer: ko-fi.com/faizov or boosty.to/itq`
    );
  }
};
