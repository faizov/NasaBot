require('dotenv').config()
const { Telegraf } = require('telegraf')
var CronJob = require('cron').CronJob;

const express = require('express')
const app = express()
var port = process.env.PORT || 8080;
var server=app.listen(port,function() {
  console.log("app running on port 8080"); });

const token: string = process.env.BOT_TOKEN as string;
const bot = new Telegraf(token)

const photoDay = require('./photoDay');
const photoMars = require('./photoMars');

let isStartPhotoDay = false

bot.start((ctx: any) => {
  ctx.reply(
    'Здравствуйте ' + ctx.from.first_name + '! \n\nНа данный момент бот находится в разработке, на данный момент реализовано получаение фото дня и получение фотографий Марса с марсохода Curiosity \n\n\nСписок команд: \n\n/photo_day - Фото дня\n\n/mars - Случайная фотография из Марса'
  );
});

bot.command('/photo_day', (ctx: any) => {
  photoDay.fetchPhotoDay(ctx)
});

bot.command('/mars', async (ctx: any) => {
  const startMessage = await ctx.reply('Начинаем искать классную фоточку...')

  photoMars.fetchMarsPhoto(ctx, startMessage.message_id);
});

bot.command('/photo_day_start', (ctx: any) => {
  if (!isStartPhotoDay) {
    isStartPhotoDay= true
    ctx.reply('Теперь фото дня будет приходить каждый день в 12:00 по МСК.')

    const job = new CronJob('48 15 * * *', function() {
      photoDay.fetchPhotoDay(ctx)
    }, null, true, 'Europe/Moscow');

    job.start();
  } else {
    ctx.reply('Данная команда уже включена!')
  }
});

bot.command('/photo_day_stop', (ctx: any) => {
  if (isStartPhotoDay) {
    isStartPhotoDay = false
    ctx.reply('Теперь фото дня НЕ будет приходить каждый день.')

    const job = new CronJob('48 15 * * *', function() {
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