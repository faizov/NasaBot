require('dotenv').config()
const { Telegraf } = require('telegraf')

const express = require('express')
const app = express()
var port = process.env.PORT || 8080;
var server=app.listen(port,function() {
  console.log("app running on port 8080"); });

const token: string = process.env.BOT_TOKEN as string;
const bot = new Telegraf(token)

const photoDay = require('./photoDay');
const photoMars = require('./photoMars');

bot.start((ctx: any) => {
  ctx.reply(
    'Здравствуйте ' + ctx.from.first_name + '! \n\nНа данный момент бот находится в разработке, на данный момент реализовано получаение фото дня. В дальшейшем планируется реализовать получение фотографий Марса с марсохода Curiosity \n\n\nСписок команд: \n\n/photo_day - Фото дня\n\n/mars - Случайная фотография из Марса'
  );
});

bot.command('/photo_day', (ctx: any) => {
  photoDay.fetchPhotoDay(ctx)
});

bot.command('/mars', (ctx: any) => {
  photoMars.fetchMarsPhoto(ctx);
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));