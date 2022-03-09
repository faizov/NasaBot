import { Context, Markup, Telegraf } from 'telegraf';
import { Update } from 'typegram';
import fetch from 'node-fetch';

const fileUrl = "https://api.nasa.gov/planetary/apod?api_key=" + process.env.API_KEY;

type TBody = {
  title: string;
  explanation: string;
  hdurl: string;
};

const token: string = process.env.BOT_TOKEN as string;

const bot: Telegraf<Context<Update>> = new Telegraf(token);

bot.start((ctx) => {
  ctx.reply(
    'Здравствуйте ' + ctx.from.first_name + '! ',
    Markup.inlineKeyboard([
      Markup.button.callback('Фото дня', 'photoDay'),
    ])
  );
});

bot.action('photoDay', async (ctx) => {
  const response = await fetch(fileUrl);
  const body: any = await response.json();

  const data: TBody = {
    title: body.title,
    explanation: body.explanation,
    hdurl: body.hdurl,
  }

  ctx.reply(data.title + "\n\n" + data.explanation);
  ctx.replyWithPhoto(data.hdurl);
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));