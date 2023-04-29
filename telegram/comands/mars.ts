import { fetchRandomMars } from "../../data/mars";

import {
  CallbackQueryContext,
  CommandContext,
  Context,
  InlineKeyboard,
} from "grammy";

export const randomMarsCommand = async (
  ctx: CommandContext<Context> | CallbackQueryContext<Context>
) => {
  const mars = await fetchRandomMars();

  const inlineKeyboard = new InlineKeyboard().text(
    "Random Mars",
    "click-random-mars"
  );

  try {
    if (mars) {
      ctx.replyWithPhoto(mars.img_src, {
        caption: `<b>Earth date: ${mars.earth_date}</b>\n<b>Sol: ${mars.sol}</b>`,
        parse_mode: "HTML",
        reply_markup: inlineKeyboard,
      });
    }
  } catch (error) {
    console.log("error", error);
  }
};
