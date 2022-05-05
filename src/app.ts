require('dotenv').config()
const { Context, session, Telegraf } = require('telegraf')
var CronJob = require('cron').CronJob;

const express = require('express')
const app = express()
var port = process.env.PORT || 8080;
var server=app.listen(port,function() {
  console.log("app running on port 8080"); });

const token: string = process.env.BOT_TOKEN as string;
const bot = new Telegraf(token)

const dbFirebase = require('./firebase')
const photoDay = require('./photoDay');
const photoMars = require('./photoMars');

type TChat = {
  chatId: number;
  type: string;
  isStartPhotoDay?: boolean;
}

const initUser = async (ctx: any) => {
  const chatRef = dbFirebase.chatFirebase.doc(`chat-${ctx.chat.id}`);
  const dataChat = await chatRef.get();
  const isStartPhotoDay = Boolean(dataChat.data()?.isStartPhotoDay)

  const chat: TChat = {
    chatId: ctx.chat.id,
    type: ctx.chat.type,
    isStartPhotoDay: isStartPhotoDay
  };

  await chatRef.set(chat);

  const countUsers = await dbFirebase.chatFirebase.get().then((snap: any) => {
    return snap.size
  });

  const countUserObj = {
    count: countUsers
  }

  await dbFirebase.statsFirebase.doc(`users`).set(countUserObj)
}

bot.start( async (ctx: any) => {
  initUser(ctx)
  const usersRef = await dbFirebase.statsFirebase.doc(`users`)
  const dataChat = await usersRef.get();
  const users = dataChat.data().count

  if (ctx.from.id == process.env.ID_ADMIN) {
    ctx.reply(
      `Users: ${users}`
    );
  } else {
    ctx.reply(
      'Hello ' + ctx.from.first_name + `! \n\nThe bot is currently under development.\n\nCommand List: \n\n/photo_day - Astronomy Picture of the Day\n\n/mars - Random photo from Mars\n\n/photo_day_start - Daily newsletter Picture of the day at 12 noon Moscow time\n\n/photo_day_stop - Disable Newsletter \n\nChannel Astronomy Picture of the Day: @nasa_channel_bot\n\ngithub.com/faizov/NasaBot`
    );
  }
});

bot.command('/photo_day', (ctx: any) => {
  initUser(ctx)
  photoDay.fetchPhotoDay(ctx)
});

bot.command('/mars', async (ctx: any) => {
  initUser(ctx)
  const startMessage = await ctx.reply(' Let`s start looking...')

  photoMars.fetchMarsPhoto(ctx, startMessage.message_id);
});

bot.command('/photo_day_start', async (ctx: any) => {
  const chatRef = dbFirebase.chatFirebase.doc(`chat-${ctx.chat.id}`);
  const dataChat = await chatRef.get();
  const isStartPhotoDay = dataChat.exists ? dataChat.data()?.isStartPhotoDay : false
  
  if (!dataChat.exists) {
    initUser(ctx)
    await chatRef.set({isStartPhotoDay: true}, { merge: true });
  }
  
  await chatRef.set({isStartPhotoDay: true}, { merge: true });

  if (!isStartPhotoDay) {
    ctx.reply('Now the photo of the day will come every day at 12:00 Moscow time.')
  } else {
    ctx.reply('This command is already enabled!')
  }
});

bot.command('/photo_day_stop', async (ctx: any) => {
  const chatRef = dbFirebase.chatFirebase.doc(`chat-${ctx.chat.id}`);
  const dataChat = await chatRef.get();
  const isStartPhotoDay = dataChat.exists ? dataChat.data()?.isStartPhotoDay : false
  
  if (!dataChat.exists) {
    initUser(ctx)
    await chatRef.set({isStartPhotoDay: false}, { merge: true });
  }
  
  await chatRef.set({isStartPhotoDay: false}, { merge: true });

  if (!isStartPhotoDay) {
    ctx.reply('This command is already disabled!')
  } else {
    ctx.reply('The photo of the day will NOT come every day.')
  }
});

const cronPhotoDay = async () => {
  const snapshot = await dbFirebase.chatFirebase.get();
  let chats: number[]  = [];

  snapshot.forEach((doc: any) => {
    const isStartPhotoDay = doc.data().isStartPhotoDay
    const chatId = doc.data().chatId

    if (isStartPhotoDay) {
      chats.push(chatId)
    }
  });

  chats.forEach((item) => {
    const job = new CronJob('00 12 * * *', function() {
      photoDay.cronFetchPhotoDay(bot, item)
    }, null, true, 'Europe/Moscow');
    job.start();
  });
}

cronPhotoDay()

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));