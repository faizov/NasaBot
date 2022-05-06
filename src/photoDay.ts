const fetchDay = require('node-fetch');

type TDay = {
    title: string;
    explanation: string;
    url: string;
    hdurl: string;
};

const photoDayUrl = "https://api.nasa.gov/planetary/apod?api_key=" + process.env.API_KEY;

const fetchPhotoDay =  (ctx: any) => {
    fetchDay(photoDayUrl)
    .then((response: any) => {
        if (response.ok) {
          response.json().then((data: any) => {
            const obj: TDay = {
              title: data.title,
              explanation: data.explanation,
              url: data.url,
              hdurl: data.hdurl,
            }
    
            const explanationShort = obj.title.length + data?.explanation.length <= 1012 ? obj.explanation : ''
            const opts = {
              'caption': `*${obj.title}* \n\n[Full photo](${data.hdurl}) \n\n${explanationShort}`,
              'parse_mode': 'markdown'
            };
    
            ctx.replyWithPhoto({url: obj.url}, opts)
          });  
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
        }

        const explanationShort = obj.title.length + data?.explanation.length <= 1012 ? obj.explanation : ''
        const opts = {
          'caption': `*${obj.title}* \n\n[Full photo](${data.hdurl}) \n\n${explanationShort}`,
          'parse_mode': 'markdown'
        };

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
exports.cronFetchPhotoDay = cronFetchPhotoDay;