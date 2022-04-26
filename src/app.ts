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
const photoDayCommand = require('./startPhotoDay')

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
  ctx.reply(
    'Здравствуйте ' + ctx.from.first_name + `! \n\nНа данный момент бот находится в разработке. Реализовано получаение "Фото дня" и получение фотографий Марса с марсохода Curiosity \n\n\nСписок команд: \n\n/photo_day - Фото дня\n\n/mars - Случайная фотография из Марса\n\nГ****код: github.com/faizov/NasaBot`
  );
});

bot.command('/photo_day', (ctx: any) => {
  initUser(ctx)
  photoDay.fetchPhotoDay(ctx)
});

bot.command('/mars', async (ctx: any) => {
  initUser(ctx)
  const startMessage = await ctx.reply('Начинаем искать классную фоточку...')

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
    ctx.reply('Теперь фото дня будет приходить каждый день в 12:00 по МСК.')
  } else {
    ctx.reply('Данная команда уже включена!')
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
    ctx.reply('Теперь фото дня НЕ будет приходить каждый день.')
  } else {
    ctx.reply('Данная команда уже выключена!')
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

const job = new CronJob('00 00 * * *', function() {
  cronPhotoDay()
}, null, true, 'Europe/Moscow');
job.start();

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));