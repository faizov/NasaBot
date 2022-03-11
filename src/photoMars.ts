const fetchMars = require('node-fetch');
const probe = require('probe-image-size');

type TMars = {
    img_src: string;
    earth_date: string;
};

const fetchMarsPhoto = (ctx: any) => {
    const intervalYear = Math.floor(Math.random() * (2022 - 2013)) + 2012;
    const intervalMonth  = Math.floor(Math.random() * (12 - 1)) + 1;
    const intervalDay  = Math.floor(Math.random() * (31 - 1)) + 1;
    
    const photoMarsUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=${intervalYear}-${intervalMonth}-${intervalDay}&camera=MAST&api_key=` + process.env.API_KEY;

    fetchMars(photoMarsUrl)
        .then((response: any) => {
        if (response.ok) {
            response.json().then( async (data: any) => {
                if (data.photos.length > 0) {
                    const randomPhoto = data.photos[Math.floor(Math.random() * data.photos.length) + 1]
                    const obj: TMars = {
                        img_src: randomPhoto.img_src,
                        earth_date: randomPhoto.earth_date,
                    }
                    const result = await probe(obj.img_src);
                    
                    if (obj.img_src && (result.width && result.height) > 600) {
                        ctx.replyWithPhoto(
                            {url: obj.img_src}, 
                            {caption: obj.earth_date}
                        )
                    } else {
                        fetchMarsPhoto(ctx)
                    }
                    
                } else {
                    fetchMarsPhoto(ctx)
                }
            })
            .catch((error: any) => {
                console.log(`photoMarsUrl`, photoMarsUrl)
                console.log(`error`, error)
                ctx.reply('Продолжаем искать классную фоточку...')
                fetchMarsPhoto(ctx)
            })
        }
        }).
        catch((error: any) => {
            ctx.reply(error)
        }
    );
}

exports.fetchMarsPhoto = fetchMarsPhoto;