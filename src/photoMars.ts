const fetchMars = require('node-fetch');

type TMars = {
    img_src: string;
    earth_date: string;
};

const fetchMarsPhoto =  (ctx: any) => {
    const intervalYear = Math.floor(Math.random() * (2022 - 2012)) + 2012;
    const intervalMonth  = Math.floor(Math.random() * (12 - 1)) + 1;
    const intervalDay  = Math.floor(Math.random() * (31 - 1)) + 1;
    
    const photoMarsUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=${intervalYear}-${intervalMonth}-${intervalDay}&camera=MAST&api_key=` + process.env.API_KEY;

    fetchMars(photoMarsUrl)
        .then((response: any) => {
        if (response.ok) {
            response.json().then((data: any) => {

            

            const randomPhoto = data.photos[Math.floor(Math.random() * data.photos.length) + 1]

            if (data.photos[0]) {

                const obj: TMars = {
                    img_src: randomPhoto.img_src,
                    earth_date: randomPhoto.earth_date,
                }

                obj.img_src && 
                ctx.replyWithPhoto(
                    {url: obj.img_src}, 
                    {caption: randomPhoto ? obj.earth_date : ''}
                )
            } else {
                fetchMarsPhoto(ctx)
            }
            });
        }
        }).
        catch((error: any) => {
            ctx.reply(error)
        }
    );
}

exports.fetchMarsPhoto = fetchMarsPhoto;