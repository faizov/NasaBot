var { Markup } = require('telegraf')
const fetchMars = require('node-fetch');
const probe = require('probe-image-size');

type TMars = {
    img_src: string;
    earth_date: string;
    sol: number;
};

const fetchMarsPhoto = (ctx: any, id: number) => {
    const intervalYear = Math.floor(Math.random() * (2022 - 2013)) + 2012;
    const intervalMonth  = Math.floor(Math.random() * (12 - 1)) + 1;
    const intervalDay  = Math.floor(Math.random() * (31 - 1)) + 1;
    
    const photoMarsUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=${intervalYear}-${intervalMonth}-${intervalDay}&camera=MAST&api_key=` + process.env.API_KEY;

    fetchMars(photoMarsUrl)
    .then((response: any) => {
        if (response.ok) {
            response.json().then( async (data: any) => {
                if (data.photos.length > 0) {
                    const randomPhoto = data.photos[Math.floor(Math.random() * data.photos.length)]
                    const obj: TMars = {
                        img_src: randomPhoto.img_src,
                        earth_date: randomPhoto.earth_date,
                        sol: randomPhoto.sol
                    }
                    const result = await probe(obj.img_src);
                    if (obj.img_src && (result.width && result.height) > 600) {
                        ctx.deleteMessage(id)
                        ctx.replyWithPhoto(
                            {url: obj.img_src}, 
                            {
                                parse_mode: 'markdown',
                                caption: `*Earth date:* ${obj.earth_date} \n*Sol:* ${obj.sol}`,
                                ...Markup.inlineKeyboard([
                                    Markup.button.callback('Another random photo from Mars!', 'Random mars'),
                                  ])
                            }
                        )
                    } else {
                        fetchMarsPhoto(ctx, id)
                    }
                    
                } else {
                    fetchMarsPhoto(ctx, id)
                }
            })
            .catch((error: any) => {
                console.log(`photoMarsUrl`, photoMarsUrl)
                console.log(`error`, error)
                fetchMarsPhoto(ctx, id)
            })
        } else {
            fetchMarsPhoto(ctx, id)
        }
    })
    .catch((error: any) => {
        ctx.telegram.sendMessage(process.env.ID_ADMIN, `Error fetchMars ${error}`)
    })
}

exports.fetchMarsPhoto = fetchMarsPhoto;