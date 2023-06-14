import {
  CallbackQueryContext,
  CommandContext,
  Context,
  GrammyError,
  InlineKeyboard,
} from "grammy";
import fetch from "node-fetch";
import { TApod } from "src/types";

export const sendApod = async (
  data: TApod,
  ctx: CommandContext<Context> | CallbackQueryContext<Context>,
  inlineKeyboard?: InlineKeyboard
) => {
  const response = data.hdurl ? await fetch(data.hdurl) : undefined;
  const buffer = response ? await response.buffer() : undefined;
  const size = buffer && buffer.byteLength;

  const imageUrl = size && size <= 130000 ? data.hdurl : data.url;
  const titlePost = data.title ? data.title : data.url;
  const message = `<b><a href="${imageUrl}">${titlePost}</a></b> \n \n<i>${
    data.date
  }</i> \n \n${data.explanation} \n \n${
    data.copyright ? `<b>Copyright:</b> ${data.copyright}` : " "
  } `;

  const includesError = ["Bad Request: message caption is too long"];

  try {
    await ctx.replyWithPhoto(data.url, {
      caption: message,
      parse_mode: "HTML",
      reply_markup: inlineKeyboard,
    });
  } catch (error) {
    if (error instanceof GrammyError) {
      if (includesError.includes(error.description)) {
        await ctx.reply(message, {
          parse_mode: "HTML",
          reply_markup: inlineKeyboard,
        });
      }
    }
  }
};
