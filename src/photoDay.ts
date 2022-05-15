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

const fetchPhotoDay = (ctx: any) => {
    fetchDay(photoDayUrl)
    .then((response: any) => {
        if (response.ok) {
          response.json().then((data: any) => {
            console.log('data', data)
            const obj: TDay = {
              title: data.title,
              explanation: data.explanation,
              media_type: data.media_type,
              url: data.url,
              hdurl: data.hdurl,
              date: data.date,
              copyright: data.copyright
            }

            const date = obj.date.split('-')
            const year = date[0].slice(-2)
            const month = date[1]
            const day = date[2]


            const explanationShort = obj.title.length + obj?.explanation.length <= 1012 ? obj.explanation : ''
            let copyright = `${obj.copyright ? `\n\nCopyright: ${obj.copyright}` : ''}`
            let linkPage = `[Explanation](https://apod.nasa.gov/apod/ap${year}${month}${day}.html)`
            
            let opts = {
              'caption': `*${obj.title}*${copyright}\n\n${linkPage} | [Full Source](${obj.hdurl})`,
              'parse_mode': 'markdown'
            };

            if (obj.media_type === 'video') {
              opts.caption = `*Video: ${obj.title}*${copyright}\n\n[Full Video](${obj.url})`
            }
            
            ctx.replyWithPhoto(obj.url, opts)
          });  
        }
    })
    .catch((error: any) => {
      console.log('error ', error)
      ctx.telegram.sendMessage(process.env.ID_ADMIN, `Error fetchPhotoDay ${error}`)
    });
}

const fetchRandomPhotoDay = (ctx: any) => {
  let intervalYear = Math.floor(Math.random() * (new Date().getFullYear() - 1995) + 1995);
  let intervalMonth  = Math.floor(Math.random() * (12 - 1)) + 1;
  let intervalDay  = Math.floor(Math.random() * (31 - 1)) + 1;
  const date = new Date(intervalYear, intervalMonth, intervalDay)
  const year = date.getFullYear().toString().slice(-2);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth()).padStart(2, '0');

  const randomPhotoDayUrl = "https://api.nasa.gov/planetary/apod?api_key=" + process.env.API_KEY + `&date=${intervalYear}-${intervalMonth}-${intervalDay}`;

  fetchDay(randomPhotoDayUrl)
  .then((response: any) => {
      if (response.ok) {
        response.json().then((data: any) => {
          const obj: TDay = {
            title: data.title,
            explanation: data.explanation,
            media_type: data.media_type,
            url: data.url,
            hdurl: data.hdurl,
            date: data.date,
            copyright: data.copyright
          }

          const explanationShort = obj.title.length + obj?.explanation.length <= 970 ? `${obj.explanation}\n\n` : `[Explanation](https://apod.nasa.gov/apod/ap${year}${month}${day}.html) | `
        
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
        });  
      } else {
        console.log('response not ok', response)
        fetchRandomPhotoDay(ctx)
      }
  })
  .catch((error: any) => {
    console.log('error ', error)
    ctx.telegram.sendMessage(process.env.ID_ADMIN, `Error fetchPhotoDay ${error}`)
  });
}

const cronFetchPhotoDay = (bot: any, chatId: number[]) => {
  fetchDay(photoDayUrl)
  .then((response: any) => {
    if (response.ok) {
      response.json().then((data: any) => {
        const obj: TDay = {
          title: data.title,
          explanation: data.explanation,
          url: data.url,
          hdurl: data.hdurl,
          media_type: data.media_type,
          date: data.date,
          copyright: data.copyright
        }
        const date = obj.date.split('-')
        const year = date[0].slice(-2)
        const month = date[1]
        const day = date[2]

        const explanationShort = obj.title.length + data?.explanation.length <= 1012 ? obj.explanation : ''
        let copyright = `${obj.copyright ? `\n\nCopyright: ${obj.copyright}` : ''}`
        let linkPage = `[Explanation](https://apod.nasa.gov/apod/ap${year}${month}${day}.html)`
        
        let opts = {
          'caption': `*${obj.title}*${copyright}\n\n${linkPage} | [Full Source](${obj.hdurl})`,
          'parse_mode': 'markdown'
        };

        if (obj.media_type === 'video') {
          opts.caption = `*Video: ${obj.title}*${copyright}\n\n[Full Video](${obj.url})`
        }

        bot.telegram.sendPhoto(
          chatId, 
          obj.url, 
          opts
        );
      });  
    }
  })
  .catch((error: any) => {
      console.log('error', error)
  });
}

exports.fetchPhotoDay = fetchPhotoDay;
exports.fetchRandomPhotoDay = fetchRandomPhotoDay;
exports.cronFetchPhotoDay = cronFetchPhotoDay;