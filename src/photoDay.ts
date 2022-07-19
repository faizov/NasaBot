var { Markup } = require('telegraf')
const fetchDay = require('node-fetch');

type TDay = {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  copyright?: string;
  media_type: string;
  date: string;
};

const photoDayUrl = "https://api.nasa.gov/planetary/apod?api_key=" + process.env.API_KEY;

const fetchApod = async (count = 0) => {
  let date = new Date(new Date().setDate(new Date().getDate() - count)).toISOString().split("T")[0];

  return await fetchDay(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}&date=${date}`)
    .then((response: any) => {
      if (response.ok) {
        return response.json()
      }
    })
    .catch((error: any) => {
      return error
    });
}

const sendApod = async (ctx: any) => {
  await fetchApod()
  .then((data: any) => {
    const obj: TDay = {
      title: data.title,
      explanation: data.explanation,
      media_type: data.media_type,
      url: data.url,
      hdurl: data.hdurl,
      date: data.date,
      copyright: data.copyright
    }

    let copyright = `${obj.copyright ? `\n\nCopyright: ${obj.copyright}` : ''}`
    let linkPage = `[Explanation](https://faizov.github.io/web-nasa/#/apod?date=${obj.date})`

    let opts = {
      'caption': `[${obj.title}](https://t.me/nasa_channel_bot)${copyright}\n\n${linkPage} | [Full Source](${obj.hdurl})`,
      'parse_mode': 'markdown'
    };

    if (obj.media_type === 'video') {
      opts.caption = `*Video:* [${obj.title}](${obj.url})\n\n${copyright}\n\n${linkPage}`
    }

    ctx.replyWithPhoto(obj.url, opts)
  })
  .catch((error: any) => {
    console.log('error ', error)
    ctx.telegram.sendMessage(process.env.ID_ADMIN, `Error fetchPhotoDay ${error}`)
  });
}

const sendRandomApod = async (ctx: any) => {
  const dateFirstApod = "1995-06-16T00:00:00.000Z";
  let currentDate = Date.parse(new Date().toString());
  let daysFirstApod = (currentDate - Date.parse(dateFirstApod)) / 86400000;
  let randomCount = Math.random() * daysFirstApod

  await fetchApod(randomCount)
  .then((data: any) => {
    const obj: TDay = {
      title: data.title,
      explanation: data.explanation,
      media_type: data.media_type,
      url: data.url,
      hdurl: data.hdurl,
      date: data.date,
      copyright: data.copyright
    }

    const explanationShort = obj.title.length + obj?.explanation.length <= 970 ? `${obj.explanation}\n\n` : `[Explanation](https://faizov.github.io/web-nasa/#/apod?date=${obj.date}) | `

    let opts = {
      'caption': `*${obj.title}* \n\n${obj.date}\n\n${explanationShort}[Full Source](${obj.hdurl})`,
      'parse_mode': 'markdown',
      ...Markup.inlineKeyboard([
        Markup.button.callback('Click for another random APOD', 'Random apod'),
      ])
    };

    if (obj.media_type === 'video') {
      opts.caption = `*Video: ${obj.title}* \n\n[Full Video](${obj.url})`
    }

    ctx.replyWithPhoto(obj.url, opts)
  })
  .catch((error: any) => {
    console.log('error ', error)
    ctx.telegram.sendMessage(process.env.ID_ADMIN, `Error fetchPhotoDay ${error}`)
  });
}

const cronSendApod = (bot: any, apod: TDay, chatId: number[]) => {
  const explanationShort = apod.title.length + apod?.explanation.length <= 1012 ? apod.explanation : ''
  let copyright = `${apod.copyright ? `\n\nCopyright: ${apod.copyright}` : ''}`
  let linkPage = `[Explanation](https://faizov.github.io/web-nasa/#/apod?date=${apod.date})`

  let opts = {
    'caption': `[${apod.title}](https://t.me/nasa_channel_bot)${copyright}\n\n${linkPage} | [Full Source](${apod.hdurl})`,
    'parse_mode': 'markdown'
  };

  if (apod.media_type === 'video') {
    opts.caption = `*Video:* [${apod.title}](${apod.url})\n\n${copyright}\n\n${linkPage}`
  }

  bot.telegram.sendPhoto(
    chatId,
    apod.url,
    opts
  );
}

exports.fetchApod = fetchApod;
exports.sendApod = sendApod;
exports.sendRandomApod = sendRandomApod;
exports.cronSendApod = cronSendApod;
