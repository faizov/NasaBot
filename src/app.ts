require('dotenv').config()
const { Telegraf } = require('telegraf')
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, getDoc } = require('firebase-admin/firestore');

var CronJob = require('cron').CronJob;

const express = require('express')
const app = express()
var port = process.env.PORT || 8080;
var server=app.listen(port,function() {
  console.log("app running on port 8080"); });

const token: string = process.env.BOT_TOKEN as string;
const bot = new Telegraf(token)

initializeApp();

const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true })
const chatsDb = db.collection('chats');

const photoDay = require('./photoDay');
const photoMars = require('./photoMars');

type TChat = {
  chatId: number;
  type: string;
  isStartPhotoDay?: boolean;
}

bot.start( async (ctx: any) => {
  const countUsers = await chatsDb.get().then((snap: any) => {
    return snap.size
  });

  ctx.reply(
    'Здравствуйте ' + ctx.from.first_name + `! \n\nНа данный момент бот находится в разработке, на данный момент реализовано получаение фото дня и получение фотографий Марса с марсохода Curiosity \n\n\nСписок команд: \n\n/photo_day - Фото дня\n\n/mars - Случайная фотография из Марса \n\n\nКоличество пользователей: ${countUsers}`
  );

  const chatRef = chatsDb.doc(`chat-${ctx.chat.id}`);
  const dataChat = await chatRef.get();
  const isStartPhotoDay = dataChat.data().isStartPhotoDay

  const chat: TChat = {
    chatId: ctx.chat.id,
    type: ctx.chat.type,
    isStartPhotoDay: isStartPhotoDay
  };

  await chatsDb.doc(`chat-${chat.chatId}`).set(chat);
});

bot.command('/photo_day', (ctx: any) => {
  photoDay.fetchPhotoDay(ctx)
});

bot.command('/mars', async (ctx: any) => {
  const startMessage = await ctx.reply('Начинаем искать классную фоточку...')

  photoMars.fetchMarsPhoto(ctx, startMessage.message_id);
});

bot.command('/photo_day_start', async (ctx: any) => {
  const chatRef = chatsDb.doc(`chat-${ctx.chat.id}`);
  const dataChat = await chatRef.get();
  const isStartPhotoDay = dataChat.data().isStartPhotoDay

  const chat: TChat = {
    chatId: ctx.chat.id,
    type: ctx.chat.type,
    isStartPhotoDay: isStartPhotoDay
  };

  if (!dataChat.exists) {
    await chatsDb.doc(`chat-${chat.chatId}`).set(chat)
    chatsDb.doc(`chat-${ctx.chat.id}`).set({
      isStartPhotoDay: true
    }, { merge: true });
  } else {
    chatsDb.doc(`chat-${ctx.chat.id}`).set({
      isStartPhotoDay: true
    }, { merge: true });
  }

  if (!isStartPhotoDay) {
    ctx.reply('Теперь фото дня будет приходить каждый день в 12:00 по МСК.')

    const job = new CronJob('00 12 * * *', function() {
      photoDay.fetchPhotoDay(ctx)
    }, null, true, 'Europe/Moscow');

    job.start();
  } else {
    ctx.reply('Данная команда уже включена!')
  }
});

bot.command('/photo_day_stop', async (ctx: any) => {
  const chatRef = chatsDb.doc(`chat-${ctx.chat.id}`);
  const dataChat = await chatRef.get();
  const isStartPhotoDay = dataChat.data().isStartPhotoDay

  const chat: TChat = {
    chatId: ctx.chat.id,
    type: ctx.chat.type,
    isStartPhotoDay: isStartPhotoDay
  };


  if (!dataChat.exists) {
    await chatsDb.doc(`chat-${chat.chatId}`).set(chat)
    chatsDb.doc(`chat-${ctx.chat.id}`).set({
      isStartPhotoDay: false
    }, { merge: true });
  } else {
    chatsDb.doc(`chat-${ctx.chat.id}`).set({
      isStartPhotoDay: false
    }, { merge: true });
  }


  if (isStartPhotoDay) {
    ctx.reply('Теперь фото дня НЕ будет приходить каждый день.')

    const job = new CronJob('00 12 * * *', function() {
      photoDay.fetchPhotoDay(ctx)
    }, null, true, 'Europe/Moscow');

    job.stop();
  } else {
    ctx.reply('Данная команда уже выключена!')
  }

});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));