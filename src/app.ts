require('dotenv').config()
const { Context, Markup, Telegraf } = require('telegraf')
const { Update } = require('typegram')
const fetch = require('node-fetch');

const fileUrl = "https://api.nasa.gov/planetary/apod?api_key=" + process.env.API_KEY;

type TBody = {
  title: string;
  explanation: string;
  url: string;
  hdurl: string;
};

const token: string = process.env.BOT_TOKEN as string;

const bot = new Telegraf(token)

bot.start((ctx: any) => {
  ctx.reply(
    'Здравствуйте ' + ctx.from.first_name + '! \n\nНа данный момент бот находится в разработке, на данный момент реализовано получаение фото дня. В дальшейшем планируется реализовать получение фотографий Марса с марсохода Curiosity \n\n\n\nСписок команд: \n\n/photo_day - Фото дня'
  );
});

bot.command('/photo_day', async (ctx: any) => {
  fetch(fileUrl)
  .then((response: any) => {
    if (response.ok) {
      response.json().then((data: any) => {
        const obj: TBody = {
          title: data.title,
          explanation: data.explanation,
          url: data.url,
          hdurl: data.hdurl,
        }

        const explanationShort = obj?.explanation.length <= 800 ? obj.explanation : ''

        const opts = {
          'caption': `*${obj.title}*\n\n${explanationShort} \n\n [Full photo](${data.hdurl})`,
          'parse_mode': 'markdown'
        };

        ctx.replyWithPhoto({url: obj.url}, opts)
      });  
    }
  }).
  catch((error: any) => {
      ctx.reply(error)
      console.log(error);
  });
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));