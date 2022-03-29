var CronJob = require('cron').CronJob;

const photoDayStart = async (ctx: any, isStartPhotoDay: boolean) => {
    if (!isStartPhotoDay) {
        ctx.reply('Теперь фото дня будет приходить каждый день в 12:00 по МСК.')
    
        const job = new CronJob('00 12 * * *', function() {
          photoDay.fetchPhotoDay(ctx)
        }, null, true, 'Europe/Moscow');
    
        job.start();
      } else {
        ctx.reply('Данная команда уже включена!')
      }
}

const photoDayStop = async (ctx: any, isStartPhotoDay: boolean) => {
    if (isStartPhotoDay) {
        ctx.reply('Теперь фото дня НЕ будет приходить каждый день.')
    
        const job = new CronJob('00 12 * * *', function() {
          photoDay.fetchPhotoDay(ctx)
        }, null, true, 'Europe/Moscow');
    
        job.stop();
      } else {
        ctx.reply('Данная команда уже выключена!')
      }
}

module.exports.photoDayStart = photoDayStart;
module.exports.photoDayStop = photoDayStop;
