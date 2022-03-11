const fetchDay = require('node-fetch');

type TDay = {
    title: string;
    explanation: string;
    url: string;
    hdurl: string;
};

const fetchPhotoDay =  (ctx: any) => {
    const photoDayUrl = "https://api.nasa.gov/planetary/apod?api_key=" + process.env.API_KEY;
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
}

exports.fetchPhotoDay = fetchPhotoDay;