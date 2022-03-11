require('dotenv').config()
const { Context, Markup, Telegraf } = require('telegraf')
const { Update } = require('typegram')
const fetch = require('node-fetch');

const express = require('express')
const app = express()
var port = process.env.PORT || 8080;
var server=app.listen(port,function() {
  console.log("app running on port 8080"); });

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
    'Здравствуйте ' + ctx.from.first_name + '! \n\nНа данный момент бот находится в разработке, на данный момент реализовано получаение фото дня. В дальшейшем планируется реализовать получение фотографий Марса с марсохода Curiosity \n\n\nСписок команд: \n\n/photo_day - Фото дня\n\n/mars - Случайная фотография из Марса'
  );
});

bot.command('/photo_day', (ctx: any) => {
  const photoDayUrl = "https://api.nasa.gov/planetary/apod?api_key=" + process.env.API_KEY;
  fetch(photoDayUrl)
  .then((response: any) => {
    if (response.ok) {
      response.json().then((data: any) => {
        const obj: TBody = {
          title: data.title,
          explanation: data.explanation,
          url: data.url,
          hdurl: data.hdurl,
        }

        // const explanationShort = obj?.explanation.length <= 800 ? obj.explanation : ''
        // \n\n${explanationShort}
        const opts = {
          'caption': `*${obj.title}* \n\n[Full photo](${data.hdurl})`,
          'parse_mode': 'markdown'
        };

        ctx.replyWithPhoto({url: obj.url}, opts)
      });  
    }
  }).
  catch((error: any) => {
      ctx.reply(error)
  });
});

bot.command('/mars', (ctx: any) => {
  const fetchMarsPhoto = () => {
    const intervalYear = Math.floor(Math.random() * (2022 - 2012)) + 2012;
    const intervalMonth  = Math.floor(Math.random() * (12 - 1)) + 1;
    const intervalDay  = Math.floor(Math.random() * (31 - 1)) + 1;
    
    const photoMarsUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=${intervalYear}-${intervalMonth}-${intervalDay}&camera=MAST&api_key=` + process.env.API_KEY;

    fetch(photoMarsUrl)
      .then((response: any) => {
        if (response.ok) {
          response.json().then((data: any) => {
            const randomPhoto = data.photos[Math.floor(Math.random() * data.photos.length) + 1]

            if (data.photos[0]) {
              ctx.replyWithPhoto(
                {url: randomPhoto?.img_src}, 
                {caption: randomPhoto.earth_date && randomPhoto.earth_date}
              )
            } else {
              fetchMarsPhoto()
            }
          });
        }
      }).
      catch((error: any) => {
          ctx.reply(error)
      }
    );
  } 

    fetchMarsPhoto();
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));